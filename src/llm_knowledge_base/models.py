from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from typing import Literal

DocumentZone = Literal["raw", "wiki", "outputs"]


@dataclass(slots=True)
class DocumentRecord:
    doc_id: str
    zone: DocumentZone
    rel_path: str
    kind: str
    title: str
    word_count: int
    mtime: float
    sha256: str
    excerpt: str = ""
    headings: list[str] = field(default_factory=list)
    links: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


@dataclass(slots=True)
class CatalogSnapshot:
    generated_at: str
    project_name: str
    records: list[DocumentRecord]

    @property
    def total_documents(self) -> int:
        return len(self.records)

    @property
    def by_zone(self) -> dict[DocumentZone, int]:
        counts: dict[DocumentZone, int] = {"raw": 0, "wiki": 0, "outputs": 0}
        for record in self.records:
            counts[record.zone] += 1
        return counts

    def to_dict(self) -> dict[str, object]:
        return {
            "generated_at": self.generated_at,
            "project_name": self.project_name,
            "records": [record.to_dict() for record in self.records],
        }

    @classmethod
    def empty(cls, project_name: str) -> "CatalogSnapshot":
        return cls(
            generated_at=datetime.now(UTC).isoformat(),
            project_name=project_name,
            records=[],
        )

    @classmethod
    def from_dict(cls, data: dict[str, object]) -> "CatalogSnapshot":
        raw_records = data.get("records", [])
        records = [
            DocumentRecord(**record)
            for record in raw_records
            if isinstance(record, dict)
        ]
        return cls(
            generated_at=str(data.get("generated_at", datetime.now(UTC).isoformat())),
            project_name=str(data.get("project_name", "Knowledge Base")),
            records=records,
        )


@dataclass(slots=True)
class SearchResult:
    record: DocumentRecord
    score: float
    matched_terms: list[str] = field(default_factory=list)


@dataclass(slots=True)
class HealthFinding:
    severity: Literal["info", "warning", "error"]
    title: str
    detail: str
    rel_path: str | None = None


@dataclass(slots=True)
class WorkflowResult:
    mode: Literal["deterministic", "openai"]
    summary: str
    files_written: list[str]
    trace: list[str] = field(default_factory=list)
    content: str = ""
