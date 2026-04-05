from __future__ import annotations

import hashlib
import json
import mimetypes
from datetime import UTC, datetime
from pathlib import Path

from .config import KnowledgeBaseConfig
from .markdown import excerpt, extract_headings, extract_markdown_links, extract_title
from .models import CatalogSnapshot, DocumentRecord
from .paths import relative_to_root

TEXT_EXTENSIONS = {
    ".md",
    ".markdown",
    ".txt",
    ".csv",
    ".tsv",
    ".json",
    ".yaml",
    ".yml",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".html",
    ".css",
}


def _sha256_for_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _kind_for_path(path: Path) -> str:
    if path.suffix.lower() == ".md":
        return "markdown"
    mime, _ = mimetypes.guess_type(path.name)
    if mime:
        return mime
    return path.suffix.lower().lstrip(".") or "file"


def _read_text_content(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="ignore")


def _build_record(config: KnowledgeBaseConfig, zone: str, path: Path) -> DocumentRecord:
    kind = _kind_for_path(path)
    is_text = path.suffix.lower() in TEXT_EXTENSIONS
    content = _read_text_content(path) if is_text else ""
    rel_path = relative_to_root(path, config.root)
    return DocumentRecord(
        doc_id=hashlib.sha1(rel_path.encode("utf-8")).hexdigest()[:12],
        zone=zone,  # type: ignore[arg-type]
        rel_path=rel_path,
        kind=kind,
        title=extract_title(path, content) if content else path.stem,
        word_count=len(content.split()) if content else 0,
        mtime=path.stat().st_mtime,
        sha256=_sha256_for_file(path),
        excerpt=excerpt(content) if content else "",
        headings=extract_headings(content) if content else [],
        links=extract_markdown_links(content) if content else [],
    )


def build_catalog(config: KnowledgeBaseConfig) -> CatalogSnapshot:
    records: list[DocumentRecord] = []
    zones = {
        "raw": config.raw_dir,
        "wiki": config.wiki_dir,
        "outputs": config.output_dir,
    }
    for zone, base in zones.items():
        if not base.exists():
            continue
        for path in sorted(p for p in base.rglob("*") if p.is_file()):
            records.append(_build_record(config, zone, path))

    return CatalogSnapshot(
        generated_at=datetime.now(UTC).isoformat(),
        project_name=config.project_name,
        records=records,
    )


def save_catalog(config: KnowledgeBaseConfig, snapshot: CatalogSnapshot) -> None:
    config.catalog_path.write_text(
        json.dumps(snapshot.to_dict(), indent=2, ensure_ascii=True),
        encoding="utf-8",
    )


def load_catalog(config: KnowledgeBaseConfig) -> CatalogSnapshot:
    if not config.catalog_path.exists():
        return CatalogSnapshot.empty(project_name=config.project_name)
    data = json.loads(config.catalog_path.read_text(encoding="utf-8"))
    return CatalogSnapshot.from_dict(data)

