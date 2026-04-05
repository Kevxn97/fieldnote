from __future__ import annotations

from pathlib import Path
import json

from .models import SourceSummary


def parse_frontmatter(markdown: str) -> tuple[dict[str, object], str]:
    if not markdown.startswith("---\n"):
        return {}, markdown
    end_marker = "\n---\n"
    end_index = markdown.find(end_marker, 4)
    if end_index == -1:
        return {}, markdown
    frontmatter_text = markdown[4:end_index]
    body = markdown[end_index + len(end_marker) :]
    data: dict[str, object] = {}
    for line in frontmatter_text.splitlines():
        if not line.strip() or ":" not in line:
            continue
        key, raw_value = line.split(":", 1)
        value = raw_value.strip()
        if value.startswith("[") or value.startswith("{"):
            try:
                data[key.strip()] = json.loads(value)
                continue
            except json.JSONDecodeError:
                pass
        data[key.strip()] = value.strip('"')
    return data, body.lstrip()


def write_frontmatter(data: dict[str, object], body: str) -> str:
    lines = ["---"]
    for key, value in data.items():
        if isinstance(value, (list, dict)):
            rendered = json.dumps(value, ensure_ascii=True)
        else:
            rendered = str(value)
        lines.append(f"{key}: {rendered}")
    lines.extend(["---", "", body.rstrip(), ""])
    return "\n".join(lines)


def load_source_summary(path: Path) -> SourceSummary:
    content = path.read_text(encoding="utf-8")
    frontmatter, body = parse_frontmatter(content)
    return SourceSummary(
        title=str(frontmatter.get("title", path.stem)),
        source_id=str(frontmatter.get("source_id", path.stem)),
        source_path=str(frontmatter.get("source_path", "")),
        kind=str(frontmatter.get("kind", "unknown")),
        concepts=[str(item) for item in frontmatter.get("concepts", [])],
        related_sources=[str(item) for item in frontmatter.get("related_sources", [])],
        body=body,
    )
