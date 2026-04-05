from __future__ import annotations

from collections import Counter

from .models import CatalogSnapshot, HealthFinding


def evaluate_health(snapshot: CatalogSnapshot) -> list[HealthFinding]:
    findings: list[HealthFinding] = []

    wiki_records = [record for record in snapshot.records if record.zone == "wiki"]
    raw_records = [record for record in snapshot.records if record.zone == "raw"]
    wiki_paths = {record.rel_path for record in wiki_records}
    title_counts = Counter(record.title for record in snapshot.records)

    if not any(record.rel_path.endswith("vault/wiki/Home.md") for record in wiki_records):
        findings.append(
            HealthFinding(
                severity="warning",
                title="Missing wiki home page",
                detail="`vault/wiki/Home.md` is not present.",
            )
        )

    for record in wiki_records:
        for link in record.links:
            if link.startswith("http://") or link.startswith("https://"):
                continue
            normalized = link.replace(".md", "")
            matched = any(
                normalized in candidate or candidate.endswith(f"{normalized}.md")
                for candidate in wiki_paths
            )
            if not matched:
                findings.append(
                    HealthFinding(
                        severity="warning",
                        title="Broken internal link",
                        detail=f"`{record.rel_path}` links to `{link}`, but no matching wiki file was found.",
                        rel_path=record.rel_path,
                    )
                )

    for title, count in title_counts.items():
        if title and count > 1:
            findings.append(
                HealthFinding(
                    severity="info",
                    title="Duplicate title",
                    detail=f'The title "{title}" appears {count} times across the repository.',
                )
            )

    summarized_raw_slugs = {
        record.rel_path.rsplit("/", 1)[-1].rsplit(".", 1)[0]
        for record in wiki_records
        if "/sources/" in record.rel_path
    }
    for record in raw_records:
        raw_slug = record.rel_path.rsplit("/", 1)[-1].rsplit(".", 1)[0]
        if raw_slug not in summarized_raw_slugs:
            findings.append(
                HealthFinding(
                    severity="info",
                    title="Raw source missing source page",
                    detail=f"`{record.rel_path}` does not have a corresponding `vault/wiki/sources/*.md` page yet.",
                    rel_path=record.rel_path,
                )
            )

    if not findings:
        findings.append(
            HealthFinding(
                severity="info",
                title="No issues detected",
                detail="Deterministic health checks did not find missing pages, broken links, or duplicate titles.",
            )
        )

    return findings

