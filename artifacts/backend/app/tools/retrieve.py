"""Retrieve tool.

Called by the orchestrator to fetch relevant chunks.
"""

from app.vector_store import retrieve_chunks


def retrieve_context(class_id: str, query: str, top_k: int = 5) -> list[dict]:
	"""Fetch relevant chunks for a class and query."""
	return retrieve_chunks(class_id=class_id, query=query, top_k=top_k)
