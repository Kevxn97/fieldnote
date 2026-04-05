from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

from .config import KnowledgeBaseConfig
from .markdown import render_markdown_page, slugify
from .models import CatalogSnapshot, HealthFinding, SearchResult


def write_markdown_output(config: KnowledgeBaseConfig, category: str, title: str, body: str) -> str:
    timestamp = datetime.now(UTC).strftime("%Y%m%d-%H%M%S")
    target_dir = config.output_dir / category
    target_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{timestamp}-{slugify(title)}.md"
    path = target_dir / filename
    path.write_text(render_markdown_page(title, body), encoding="utf-8")
    return path.relative_to(config.root).as_posix()


def render_search_results(query: str, results: list[SearchResult]) -> str:
    lines = [f"Query: `{query}`", ""]
    if not results:
        lines.append("No matches found.")
        return "\n".join(lines)

    for index, result in enumerate(results, start=1):
        lines.extend(
            [
                f"{index}. **{result.record.title}**",
                f"   - Path: `{result.record.rel_path}`",
                f"   - Score: {result.score:.2f}",
                f"   - Match terms: {', '.join(result.matched_terms) or 'n/a'}",
                f"   - Excerpt: {result.record.excerpt or 'n/a'}",
                "",
            ]
        )
    return "\n".join(lines).rstrip()


def render_health_report(findings: list[HealthFinding]) -> str:
    lines = []
    for finding in findings:
        lines.append(f"## {finding.severity.upper()}: {finding.title}")
        lines.append("")
        if finding.rel_path:
            lines.append(f"- Path: `{finding.rel_path}`")
        lines.append(f"- Detail: {finding.detail}")
        lines.append("")
    return "\n".join(lines).rstrip()


def render_dashboard_seed(snapshot: CatalogSnapshot, recent_outputs: list[str]) -> dict[str, object]:
    recent_records = sorted(
        [record for record in snapshot.records if record.zone == "outputs"],
        key=lambda record: record.mtime,
        reverse=True,
    )[:6]
    return {
        "project": snapshot.project_name,
        "generatedAt": snapshot.generated_at,
        "counts": snapshot.by_zone,
        "recentOutputs": recent_outputs
        or [
            {
                "title": record.title,
                "path": record.rel_path,
                "kind": record.kind,
            }
            for record in recent_records
        ],
    }

