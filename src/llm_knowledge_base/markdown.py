from __future__ import annotations

import re
from pathlib import Path

LINK_RE = re.compile(r"\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)


def slugify(value: str) -> str:
    normalized = value.strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return normalized.strip("-") or "untitled"


def extract_markdown_links(text: str) -> list[str]:
    links: list[str] = []
    for wiki_target, _, markdown_target in LINK_RE.findall(text):
        target = wiki_target or markdown_target
        if target:
            links.append(target.strip())
    return links


def extract_headings(text: str) -> list[str]:
    return [match.group(2).strip() for match in HEADING_RE.finditer(text)]


def extract_title(path: Path, text: str) -> str:
    for heading in extract_headings(text):
        if heading:
            return heading
    return path.stem.replace("-", " ").replace("_", " ").strip().title()


def strip_markdown(text: str) -> str:
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"[*_>#-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def excerpt(text: str, limit: int = 280) -> str:
    clean = strip_markdown(text)
    if len(clean) <= limit:
        return clean
    return clean[: limit - 1].rstrip() + "…"


def render_markdown_page(title: str, body: str, metadata: dict[str, str] | None = None) -> str:
    parts: list[str] = []
    if metadata:
        parts.extend(["---"])
        for key, value in metadata.items():
            parts.append(f"{key}: {value}")
        parts.extend(["---", ""])
    parts.append(f"# {title}")
    parts.append("")
    parts.append(body.rstrip())
    parts.append("")
    return "\n".join(parts)
