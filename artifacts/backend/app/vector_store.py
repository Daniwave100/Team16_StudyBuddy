"""Vector store abstraction.

Tools call into this module to save and retrieve content.
"""

from __future__ import annotations

from datetime import datetime
import os
from pathlib import Path
from threading import Lock
from typing import Any
import json
import re
import uuid

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

VECTOR_BACKEND = os.getenv("VECTOR_BACKEND", "supabase").lower()
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "1536"))

STORE_PATH = Path(__file__).resolve().parents[1] / "data" / "vector_store.json"
_STORE_LOCK = Lock()
_SCHEMA_READY = False


def _ensure_store_file() -> None:
	STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
	if not STORE_PATH.exists():
		STORE_PATH.write_text(json.dumps({"classes": {}}, indent=2), encoding="utf-8")


def _load_store() -> dict[str, Any]:
	_ensure_store_file()
	with _STORE_LOCK:
		return json.loads(STORE_PATH.read_text(encoding="utf-8"))


def _save_store(store: dict[str, Any]) -> None:
	with _STORE_LOCK:
		STORE_PATH.write_text(json.dumps(store, indent=2), encoding="utf-8")


def _tokenize(text: str) -> list[str]:
	return re.findall(r"[a-zA-Z0-9_]+", text.lower())


def _use_supabase_backend() -> bool:
	return VECTOR_BACKEND == "supabase" and bool(SUPABASE_DB_URL)


def _get_openai_client():
	from openai import OpenAI

	return OpenAI()


def _to_pgvector_literal(vector: list[float]) -> str:
	return "[" + ",".join(f"{value:.12f}" for value in vector) + "]"


def _embed_texts(texts: list[str]) -> list[list[float]]:
	client = _get_openai_client()
	response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
	return [item.embedding for item in response.data]


def _get_db_connection():
	import psycopg2

	return psycopg2.connect(SUPABASE_DB_URL)


def _ensure_supabase_schema() -> None:
	global _SCHEMA_READY
	if _SCHEMA_READY:
		return

	with _get_db_connection() as connection:
		with connection.cursor() as cursor:
			cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
			cursor.execute(
				f"""
				CREATE TABLE IF NOT EXISTS study_chunks (
					id UUID PRIMARY KEY,
					class_id TEXT NOT NULL,
					source TEXT NOT NULL,
					chunk_index INTEGER NOT NULL,
					content TEXT NOT NULL,
					embedding vector({EMBEDDING_DIMENSIONS}) NOT NULL,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				);
				"""
			)
			cursor.execute(
				"""
				CREATE INDEX IF NOT EXISTS idx_study_chunks_class_id
				ON study_chunks (class_id);
				"""
			)

	_SCHEMA_READY = True


def _add_text_documents_supabase(class_id: str, documents: list[dict[str, str]]) -> list[dict[str, Any]]:
	_ensure_supabase_schema()

	summaries: list[dict[str, Any]] = []
	rows_to_insert: list[tuple[str, str, str, int, str, str]] = []

	for document in documents:
		source = document["source"]
		chunks = _chunk_text(document["text"])
		summaries.append({"filename": source, "chunk_count": len(chunks)})

		if not chunks:
			continue

		embeddings = _embed_texts(chunks)
		for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
			rows_to_insert.append(
				(
					str(uuid.uuid4()),
					class_id,
					source,
					index,
					chunk,
					_to_pgvector_literal(embedding),
				)
			)

	if not rows_to_insert:
		return summaries

	with _get_db_connection() as connection:
		with connection.cursor() as cursor:
			cursor.executemany(
				"""
				INSERT INTO study_chunks (id, class_id, source, chunk_index, content, embedding)
				VALUES (%s, %s, %s, %s, %s, %s::vector)
				""",
				rows_to_insert,
			)

	return summaries


def _retrieve_chunks_supabase(class_id: str, query: str, top_k: int) -> list[dict[str, Any]]:
	_ensure_supabase_schema()
	query_vector = _to_pgvector_literal(_embed_texts([query])[0])

	with _get_db_connection() as connection:
		with connection.cursor() as cursor:
			cursor.execute(
				"""
				SELECT source, content, 1 - (embedding <=> %s::vector) AS score
				FROM study_chunks
				WHERE class_id = %s
				ORDER BY embedding <=> %s::vector
				LIMIT %s
				""",
				(query_vector, class_id, query_vector, top_k),
			)
			rows = cursor.fetchall()

	return [{"source": row[0], "text": row[1], "score": float(row[2])} for row in rows]


def _has_class_content_supabase(class_id: str) -> bool:
	_ensure_supabase_schema()

	with _get_db_connection() as connection:
		with connection.cursor() as cursor:
			cursor.execute("SELECT 1 FROM study_chunks WHERE class_id = %s LIMIT 1", (class_id,))
			return cursor.fetchone() is not None


def _chunk_text(text: str, chunk_size: int = 900, overlap: int = 120) -> list[str]:
	normalized = " ".join(text.split())
	if not normalized:
		return []

	chunks: list[str] = []
	start = 0
	while start < len(normalized):
		end = min(start + chunk_size, len(normalized))
		chunks.append(normalized[start:end])
		if end == len(normalized):
			break
		start = max(0, end - overlap)
	return chunks


def add_text_documents(class_id: str, documents: list[dict[str, str]]) -> list[dict[str, Any]]:
	"""Add raw text documents to a class store and return ingest summary per file."""
	if _use_supabase_backend():
		return _add_text_documents_supabase(class_id=class_id, documents=documents)

	store = _load_store()
	class_chunks = store.setdefault("classes", {}).setdefault(class_id, [])

	summaries: list[dict[str, Any]] = []
	now = datetime.utcnow().isoformat()

	for document in documents:
		source = document["source"]
		text = document["text"]
		chunks = _chunk_text(text)
		for chunk in chunks:
			class_chunks.append(
				{
					"id": str(uuid.uuid4()),
					"source": source,
					"text": chunk,
					"tokens": _tokenize(chunk),
					"created_at": now,
				}
			)
		summaries.append({"filename": source, "chunk_count": len(chunks)})

	_save_store(store)
	return summaries


def retrieve_chunks(class_id: str, query: str, top_k: int = 5) -> list[dict[str, Any]]:
	"""Retrieve best matching chunks for a class using lexical overlap scoring."""
	if _use_supabase_backend():
		return _retrieve_chunks_supabase(class_id=class_id, query=query, top_k=top_k)

	store = _load_store()
	chunks: list[dict[str, Any]] = store.get("classes", {}).get(class_id, [])
	if not chunks:
		return []

	query_tokens = set(_tokenize(query))
	if not query_tokens:
		# No query tokens: return most recent chunks
		return [
			{"source": c["source"], "text": c["text"], "score": 0}
			for c in chunks[-top_k:]
		]

	scored: list[tuple[int, dict[str, Any]]] = []
	for chunk in chunks:
		chunk_tokens = set(chunk.get("tokens", []))
		score = len(query_tokens & chunk_tokens)
		scored.append((score, chunk))

	scored.sort(key=lambda item: item[0], reverse=True)

	# If no token overlap found, return most recent chunks as fallback
	if scored[0][0] == 0:
		return [
			{"source": c["source"], "text": c["text"], "score": 0}
			for c in chunks[-top_k:]
		]

	return [
		{"source": chunk["source"], "text": chunk["text"], "score": score}
		for score, chunk in scored[:top_k]
	]


def has_class_content(class_id: str) -> bool:
	if _use_supabase_backend():
		return _has_class_content_supabase(class_id=class_id)

	store = _load_store()
	return bool(store.get("classes", {}).get(class_id))
