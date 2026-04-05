from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

from .catalog import build_catalog, load_catalog, save_catalog
from .config import KnowledgeBaseConfig
from .health import evaluate_health
from .markdown import render_markdown_page, slugify
from .models import CatalogSnapshot, DocumentRecord, WorkflowResult
from .openai_workflows import OpenAIWorkflowClient
from .paths import ensure_project_layout
from .reporting import render_dashboard_seed, render_health_report, render_search_results, write_markdown_output
from .repository import ingest_paths, write_starter_files
from .search import search_catalog


def initialize_project(config: KnowledgeBaseConfig) -> WorkflowResult:
    ensure_project_layout(config)
    written = write_starter_files(config)
    snapshot = build_catalog(config)
    save_catalog(config, snapshot)
    return WorkflowResult(
        mode="deterministic",
        summary="Initialized vault directories and starter wiki files.",
        files_written=written + [config.catalog_path.relative_to(config.root).as_posix()],
        trace=["layout -> starter files -> catalog"],
    )


def ingest_sources(config: KnowledgeBaseConfig, sources: list[str], *, mode: str = "copy") -> WorkflowResult:
    written = ingest_paths(config, sources, mode=mode)
    snapshot = build_catalog(config)
    save_catalog(config, snapshot)
    return WorkflowResult(
        mode="deterministic",
        summary=f"Ingested {len(written)} source file(s) into raw/.",
        files_written=written + [config.catalog_path.relative_to(config.root).as_posix()],
        trace=["ingest -> catalog"],
    )


def _source_page_path(config: KnowledgeBaseConfig, record: DocumentRecord) -> Path:
    stem = Path(record.rel_path).stem
    return config.wiki_dir / "sources" / f"{slugify(stem)}.md"


def _render_source_page(record: DocumentRecord) -> str:
    body_lines = [
        f"Source path: `{record.rel_path}`",
        "",
        f"- Kind: `{record.kind}`",
        f"- Word count: {record.word_count}",
        f"- Last modified: {datetime.fromtimestamp(record.mtime, tz=UTC).isoformat()}",
        "",
        "## Excerpt",
        "",
        record.excerpt or "Binary or unsupported source. Keep the original file in `raw/` for later processing.",
        "",
        "## Derived Notes",
        "",
        "- This page is generated from the raw source inventory.",
        "- Run `kb compile` with an OpenAI key configured to enrich the wiki with higher-level synthesis.",
    ]
    return render_markdown_page(
        title=record.title,
        body="\n".join(body_lines),
        metadata={
            "generated_from": record.rel_path,
            "generated_at": datetime.now(UTC).isoformat(),
        },
    )


def _render_home_page(snapshot: CatalogSnapshot) -> str:
    counts = snapshot.by_zone
    latest_sources = [record for record in snapshot.records if record.zone == "raw"][:8]
    lines = [
        "## Snapshot",
        "",
        f"- Raw sources: {counts['raw']}",
        f"- Wiki pages: {counts['wiki']}",
        f"- Outputs: {counts['outputs']}",
        "",
        "## Recent raw sources",
        "",
    ]
    if latest_sources:
        for record in latest_sources:
            lines.append(f"- [[sources/{slugify(Path(record.rel_path).stem)}|{record.title}]]")
    else:
        lines.append("- No sources yet. Add files to `raw/` and run `kb compile`.")

    lines.extend(
        [
            "",
            "## Core routes",
            "",
            "- [[Index]]",
            "- [[Knowledge Map]]",
            "- [[System Health]]",
        ]
    )
    return render_markdown_page(
        title="Home",
        body="\n".join(lines),
        metadata={"generated_at": datetime.now(UTC).isoformat()},
    )


def _render_index_page(snapshot: CatalogSnapshot) -> str:
    wiki_records = [record for record in snapshot.records if record.zone == "wiki" and record.rel_path.endswith(".md")]
    lines = ["## Wiki Pages", ""]
    for record in sorted(wiki_records, key=lambda item: item.title.lower()):
        rel = record.rel_path.split("vault/wiki/", 1)[-1]
        lines.append(f"- [{record.title}]({rel})")
    if len(lines) == 2:
        lines.append("- No wiki pages yet.")
    return render_markdown_page(
        title="Index",
        body="\n".join(lines),
        metadata={"generated_at": datetime.now(UTC).isoformat()},
    )


def compile_knowledge_base(config: KnowledgeBaseConfig, *, use_openai: bool = True) -> WorkflowResult:
    ensure_project_layout(config)
    initial_snapshot = build_catalog(config)
    files_written: list[str] = []

    for record in [record for record in initial_snapshot.records if record.zone == "raw"]:
        target = _source_page_path(config, record)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(_render_source_page(record), encoding="utf-8")
        files_written.append(target.relative_to(config.root).as_posix())

    snapshot = build_catalog(config)
    home_path = config.wiki_dir / "Home.md"
    index_path = config.wiki_dir / "Index.md"
    knowledge_map_path = config.wiki_dir / "Knowledge Map.md"

    home_path.write_text(_render_home_page(snapshot), encoding="utf-8")
    index_path.write_text(_render_index_page(snapshot), encoding="utf-8")
    files_written.extend(
        [
            home_path.relative_to(config.root).as_posix(),
            index_path.relative_to(config.root).as_posix(),
        ]
    )

    trace = ["scan raw -> source pages -> home/index"]
    mode = "deterministic"
    if use_openai and config.openai_api_key:
        try:
            llm = OpenAIWorkflowClient(config)
            llm_result = llm.compile(snapshot)
            if llm_result.content:
                knowledge_map_path.write_text(
                    render_markdown_page(
                        "Knowledge Map",
                        llm_result.content,
                        metadata={
                            "generated_at": datetime.now(UTC).isoformat(),
                            "mode": "openai",
                        },
                    ),
                    encoding="utf-8",
                )
                files_written.append(knowledge_map_path.relative_to(config.root).as_posix())
                trace.extend(llm_result.trace)
                mode = "openai"
        except Exception as exc:
            trace.append(f"openai skipped: {exc}")

    snapshot = build_catalog(config)
    save_catalog(config, snapshot)
    files_written.append(config.catalog_path.relative_to(config.root).as_posix())
    return WorkflowResult(
        mode=mode,  # type: ignore[arg-type]
        summary=f"Compiled wiki scaffolding for {snapshot.by_zone['raw']} raw source(s).",
        files_written=files_written,
        trace=trace,
    )


def ask_question(
    config: KnowledgeBaseConfig,
    question: str,
    *,
    limit: int | None = None,
    use_openai: bool = True,
) -> WorkflowResult:
    snapshot = load_catalog(config)
    if snapshot.total_documents == 0:
        snapshot = build_catalog(config)
        save_catalog(config, snapshot)

    search_results = search_catalog(snapshot, question, limit=limit or config.max_search_results)
    deterministic_body = "\n".join(
        [
            "## Short answer",
            "",
            "This deterministic fallback ranks local files by lexical relevance. Use an OpenAI key for a richer synthesized answer.",
            "",
            "## Best local matches",
            "",
            render_search_results(question, search_results),
            "",
            "## Suggested next step",
            "",
            "- Run the same command with `OPENAI_API_KEY` configured to generate a higher-level markdown report.",
        ]
    )

    mode = "deterministic"
    trace = ["catalog -> search -> report"]
    body = deterministic_body
    if use_openai and config.openai_api_key:
        try:
            llm = OpenAIWorkflowClient(config)
            llm_result = llm.ask(question, search_results)
            if llm_result.content:
                body = llm_result.content
                mode = "openai"
                trace.extend(llm_result.trace)
        except Exception as exc:
            trace.append(f"openai skipped: {exc}")

    output_path = write_markdown_output(config, "reports", f"Answer {question}", body)
    snapshot = build_catalog(config)
    save_catalog(config, snapshot)
    return WorkflowResult(
        mode=mode,  # type: ignore[arg-type]
        summary=f"Wrote answer report for question: {question}",
        files_written=[output_path, config.catalog_path.relative_to(config.root).as_posix()],
        trace=trace,
        content=body,
    )


def heal_knowledge_base(config: KnowledgeBaseConfig, *, use_openai: bool = True) -> WorkflowResult:
    snapshot = load_catalog(config)
    if snapshot.total_documents == 0:
        snapshot = build_catalog(config)
        save_catalog(config, snapshot)
    findings = evaluate_health(snapshot)

    body = "\n".join(
        [
            "## Deterministic health checks",
            "",
            render_health_report(findings),
        ]
    )
    mode = "deterministic"
    trace = ["catalog -> health checks -> report"]
    if use_openai and config.openai_api_key:
        try:
            llm = OpenAIWorkflowClient(config)
            llm_result = llm.heal(findings)
            if llm_result.content:
                body = "\n\n".join([body, "## OpenAI synthesis", "", llm_result.content])
                mode = "openai"
                trace.extend(llm_result.trace)
        except Exception as exc:
            trace.append(f"openai skipped: {exc}")

    output_path = write_markdown_output(config, "reports", "Knowledge Base Health Check", body)
    system_health_path = config.wiki_dir / "System Health.md"
    system_health_path.write_text(
        render_markdown_page("System Health", body, metadata={"generated_at": datetime.now(UTC).isoformat()}),
        encoding="utf-8",
    )
    snapshot = build_catalog(config)
    save_catalog(config, snapshot)
    return WorkflowResult(
        mode=mode,  # type: ignore[arg-type]
        summary="Wrote knowledge-base health report.",
        files_written=[
            output_path,
            system_health_path.relative_to(config.root).as_posix(),
            config.catalog_path.relative_to(config.root).as_posix(),
        ],
        trace=trace,
        content=body,
    )


def dashboard_payload(config: KnowledgeBaseConfig) -> dict[str, object]:
    snapshot = load_catalog(config)
    if snapshot.total_documents == 0:
        snapshot = build_catalog(config)
        save_catalog(config, snapshot)

    recent_outputs = recent_outputs_payload(config, snapshot)
    seed = render_dashboard_seed(snapshot, recent_outputs)
    summary = {
        "health": "Ready" if snapshot.total_documents else "Empty",
        "lastSync": snapshot.generated_at,
        "counts": {
            "raw": snapshot.by_zone["raw"],
            "wiki": snapshot.by_zone["wiki"],
            "outputs": snapshot.by_zone["outputs"],
            "questions": len([record for record in snapshot.records if record.zone == "outputs" and "answer" in record.title.lower()]),
        },
    }
    return {
        "summary": summary,
        "results": [
            {
                "title": record.title,
                "path": record.rel_path,
                "kind": record.zone,
                "excerpt": record.excerpt,
                "tags": [record.kind, record.zone],
            }
            for record in snapshot.records[:8]
        ],
        "recentOutputs": recent_outputs,
        "seed": seed,
    }


def recent_outputs_payload(config: KnowledgeBaseConfig, snapshot: CatalogSnapshot | None = None) -> list[dict[str, str]]:
    snapshot = snapshot or load_catalog(config)
    output_records = sorted(
        [record for record in snapshot.records if record.zone == "outputs"],
        key=lambda record: record.mtime,
        reverse=True,
    )[:6]
    return [
        {
            "title": record.title,
            "path": record.rel_path,
            "excerpt": record.excerpt,
        }
        for record in output_records
    ]
