from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
import json

from pypdf import PdfReader

from .models import RawDocument
from .utils import file_sha256, make_source_id


TEXT_SUFFIXES = {
    ".md",
    ".markdown",
    ".txt",
    ".json",
    ".csv",
    ".tsv",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".yaml",
    ".yml",
    ".toml",
    ".rst",
}
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}


class _HTMLStripper(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self._parts.append(data)

    def get_text(self) -> str:
        return " ".join(part.strip() for part in self._parts if part.strip())


def _read_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(str(path))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    if suffix in {".html", ".htm"}:
        stripper = _HTMLStripper()
        stripper.feed(path.read_text(encoding="utf-8", errors="ignore"))
        return stripper.get_text()
    if suffix == ".json":
        try:
            data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
            return json.dumps(data, indent=2, ensure_ascii=True)
        except json.JSONDecodeError:
            return path.read_text(encoding="utf-8", errors="ignore")
    return path.read_text(encoding="utf-8", errors="ignore")


def detect_kind(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return "pdf"
    if suffix in IMAGE_SUFFIXES:
        return "image"
    if suffix in {".md", ".markdown"}:
        return "markdown"
    if suffix in {".html", ".htm"}:
        return "html"
    if suffix == ".json":
        return "json"
    if suffix in TEXT_SUFFIXES:
        return "text"
    return "binary"


def read_raw_document(path: Path, root: Path, max_chars: int) -> RawDocument:
    relative_path = path.relative_to(root)
    kind = detect_kind(path)
    truncated = False
    if kind == "image":
        excerpt = (
            f"Image asset stored at {relative_path.as_posix()}. "
            "Treat this as a visual reference unless an OCR workflow is added later."
        )
    elif kind == "binary":
        excerpt = (
            f"Binary asset stored at {relative_path.as_posix()}. "
            "No direct text extraction is available in this MVP."
        )
    else:
        text = _read_text(path)
        if len(text) > max_chars:
            text = text[:max_chars]
            truncated = True
        excerpt = text.strip()

    return RawDocument(
        source_id=make_source_id(relative_path),
        relative_path=relative_path.as_posix(),
        absolute_path=path,
        kind=kind,
        sha256=file_sha256(path),
        excerpt=excerpt,
        truncated=truncated,
    )


def iter_source_files(raw_root: Path) -> Iterable[Path]:
    for path in sorted(raw_root.rglob("*")):
        if not path.is_file():
            continue
        if any(part.startswith(".") for part in path.relative_to(raw_root).parts):
            continue
        yield path
