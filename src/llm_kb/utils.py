from __future__ import annotations

from datetime import datetime, timezone
UTC = timezone.utc
from hashlib import sha256
from pathlib import Path
import re


TOKEN_RE = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9_-]{1,}")


def slugify(value: str) -> str:
    lowered = value.lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    return normalized or "item"


def ensure_directory(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def file_sha256(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(64 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def utc_timestamp() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def date_slug() -> str:
    return datetime.now(UTC).strftime("%Y%m%d-%H%M%S")


def tokenize(text: str) -> list[str]:
    return [match.group(0).lower() for match in TOKEN_RE.finditer(text)]


def make_source_id(relative_path: Path) -> str:
    stem = relative_path.as_posix().replace("/", "--")
    return slugify(stem)
