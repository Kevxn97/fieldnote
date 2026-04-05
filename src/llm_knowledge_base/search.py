from __future__ import annotations

from collections import Counter

from .models import CatalogSnapshot, SearchResult


def _tokenize(text: str) -> list[str]:
    return [token for token in "".join(ch.lower() if ch.isalnum() else " " for ch in text).split() if token]


def search_catalog(snapshot: CatalogSnapshot, query: str, limit: int = 8) -> list[SearchResult]:
    terms = _tokenize(query)
    if not terms:
        return []

    query_counts = Counter(terms)
    results: list[SearchResult] = []
    for record in snapshot.records:
        haystack = " ".join([record.title, record.rel_path, record.excerpt, " ".join(record.headings)])
        haystack_tokens = Counter(_tokenize(haystack))
        score = 0.0
        matched_terms: list[str] = []
        for term, weight in query_counts.items():
            count = haystack_tokens.get(term, 0)
            if count:
                score += count * weight
                matched_terms.append(term)
        if record.title.lower() == query.lower():
            score += 5.0
        elif query.lower() in record.title.lower():
            score += 3.0
        if score:
            results.append(SearchResult(record=record, score=score, matched_terms=matched_terms))

    results.sort(key=lambda item: (-item.score, item.record.rel_path))
    return results[:limit]

