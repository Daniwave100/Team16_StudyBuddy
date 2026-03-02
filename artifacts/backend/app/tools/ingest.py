"""Ingest tool.

Called by study routes to save notes into the store.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from app.vector_store import add_text_documents


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".docx"}


def _extract_pdf_text(content: bytes) -> str:
	from pypdf import PdfReader

	reader = PdfReader(BytesIO(content))
	page_text = [page.extract_text() or "" for page in reader.pages]
	return "\n".join(page_text).strip()


def _extract_docx_text(content: bytes) -> str:
	from docx import Document

	document = Document(BytesIO(content))
	paragraph_text = [paragraph.text for paragraph in document.paragraphs if paragraph.text]
	return "\n".join(paragraph_text).strip()


def _extract_txt_text(content: bytes) -> str:
	try:
		return content.decode("utf-8").strip()
	except UnicodeDecodeError:
		return content.decode("latin-1").strip()


def extract_text(filename: str, content: bytes) -> str:
	extension = Path(filename).suffix.lower()
	if extension not in SUPPORTED_EXTENSIONS:
		raise ValueError(f"Unsupported file type: {extension}")

	if extension == ".pdf":
		return _extract_pdf_text(content)
	if extension == ".docx":
		return _extract_docx_text(content)
	return _extract_txt_text(content)


def ingest_files(class_id: str, files: list[tuple[str, bytes]]) -> list[dict]:
	documents: list[dict[str, str]] = []

	for filename, content in files:
		text = extract_text(filename=filename, content=content)
		if not text:
			continue
		documents.append({"source": filename, "text": text})

	if not documents:
		return []

	return add_text_documents(class_id=class_id, documents=documents)
