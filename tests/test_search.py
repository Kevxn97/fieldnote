from llm_kb.models import SearchDocument
from llm_kb.search import search_documents


def test_search_documents_prefers_stronger_match() -> None:
    docs = [
        SearchDocument(
            doc_id="1",
            path="wiki/sources/a.md",
            title="Knowledge Graphs",
            kind="source",
            text="Knowledge graphs connect entities and help retrieval.",
        ),
        SearchDocument(
            doc_id="2",
            path="wiki/sources/b.md",
            title="Gardening Notes",
            kind="source",
            text="Tomatoes like warm weather and good drainage.",
        ),
    ]
    hits = search_documents(docs, "knowledge retrieval", top_k=2)
    assert hits
    assert hits[0].doc_id == "1"
