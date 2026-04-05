from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass(slots=True)
class RawDocument:
    source_id: str
    relative_path: str
    absolute_path: Path
    kind: str
    sha256: str
    excerpt: str
    truncated: bool


@dataclass(slots=True)
class SearchDocument:
    doc_id: str
    path: str
    title: str
    kind: str
    text: str

    def to_json(self) -> dict[str, str]:
        return asdict(self)


@dataclass(slots=True)
class SearchHit:
    doc_id: str
    path: str
    title: str
    kind: str
    score: float
    snippet: str


@dataclass(slots=True)
class SourceSummary:
    title: str
    source_id: str
    source_path: str
    kind: str
    concepts: list[str]
    related_sources: list[str]
    body: str
