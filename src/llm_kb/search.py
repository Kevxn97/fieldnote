from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import math

from .markdown import parse_frontmatter
from .models import SearchDocument, SearchHit
from .utils import tokenize


def build_documents(paths: list[Path]) -> list[SearchDocument]:
    documents: list[SearchDocument] = []
    for path in paths:
        text = path.read_text(encoding="utf-8", errors="ignore")
        frontmatter, body = parse_frontmatter(text)
        title = str(frontmatter.get("title", path.stem))
        kind = str(frontmatter.get("kind", "markdown"))
        documents.append(
            SearchDocument(
                doc_id=path.stem,
                path=path.as_posix(),
                title=title,
                kind=kind,
                text=body,
            )
        )
    return documents


def write_index(index_path: Path, documents: list[SearchDocument]) -> None:
    payload = {"documents": [doc.to_json() for doc in documents]}
    index_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_index(index_path: Path) -> list[SearchDocument]:
    if not index_path.exists():
        return []
    payload = json.loads(index_path.read_text(encoding="utf-8"))
    return [SearchDocument(**item) for item in payload.get("documents", [])]


def search_documents(documents: list[SearchDocument], query: str, top_k: int = 8) -> list[SearchHit]:
    terms = tokenize(query)
    if not terms:
        return []
    results: list[SearchHit] = []
    doc_count = max(len(documents), 1)
    doc_freq: Counter[str] = Counter()
    tokenized_docs: dict[str, list[str]] = {}
    for doc in documents:
        tokens = tokenize(doc.text)
        tokenized_docs[doc.doc_id] = tokens
        doc_freq.update(set(tokens))

    for doc in documents:
        tokens = tokenized_docs[doc.doc_id]
        if not tokens:
            continue
        counts = Counter(tokens)
        score = 0.0
        for term in terms:
            tf = counts[term]
            if tf == 0:
                continue
            idf = math.log((1 + doc_count) / (1 + doc_freq[term])) + 1
            score += tf * idf
        if score <= 0:
            continue
        lower_text = doc.text.lower()
        index = min((lower_text.find(term) for term in terms if term in lower_text), default=0)
        snippet = doc.text[max(index - 100, 0) : index + 220].strip().replace("\n", " ")
        results.append(
            SearchHit(
                doc_id=doc.doc_id,
                path=doc.path,
                title=doc.title,
                kind=doc.kind,
                score=score,
                snippet=snippet,
            )
        )
    return sorted(results, key=lambda item: item.score, reverse=True)[:top_k]
