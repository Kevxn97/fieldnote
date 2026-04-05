from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import asyncio
import json

from ..config import AppConfig
from ..markdown import load_source_summary, parse_frontmatter, write_frontmatter
from ..models import RawDocument, SourceSummary
from ..openai_runtime import run_text_agent
from ..parsers import iter_source_files, read_raw_document
from ..paths import RepoPaths
from ..prompts import (
    CONCEPT_WRITER_INSTRUCTIONS,
    SOURCE_SUMMARIZER_INSTRUCTIONS,
    build_concept_prompt,
    build_source_prompt,
)
from ..search import build_documents, write_index
from ..utils import ensure_directory, slugify


SOURCE_STATE_FILENAME = "source-hashes.json"
SEARCH_INDEX_FILENAME = "search-index.json"


async def compile_vault(config: AppConfig, force: bool = False) -> dict[str, int]:
    repo_paths = RepoPaths.from_config(config)
    for directory in repo_paths.all_directories():
        ensure_directory(directory)

    state_path = repo_paths.state_dir / SOURCE_STATE_FILENAME
    state = _load_json(state_path)

    raw_docs = [
        read_raw_document(path, repo_paths.raw, config.compile.max_source_chars)
        for path in iter_source_files(repo_paths.raw)
    ]
    changed_docs = [
        doc for doc in raw_docs if force or state.get(doc.source_id) != doc.sha256
    ]
    await _compile_sources(config, repo_paths, changed_docs)

    for doc in raw_docs:
        state[doc.source_id] = doc.sha256
    state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    source_summaries = _load_all_source_summaries(repo_paths.wiki_sources)
    await _compile_concepts(config, repo_paths, source_summaries)
    _refresh_source_backlinks(repo_paths.wiki_sources)
    _write_indexes(repo_paths)
    _write_search_index(repo_paths)

    return {
        "raw_docs": len(raw_docs),
        "updated_sources": len(changed_docs),
        "concepts": len(list(repo_paths.wiki_concepts.glob("*.md"))),
    }


async def _compile_sources(
    config: AppConfig, repo_paths: RepoPaths, docs: list[RawDocument]
) -> None:
    if not docs:
        return
    semaphore = asyncio.Semaphore(config.compile.concurrency)

    async def worker(doc: RawDocument) -> None:
        async with semaphore:
            prompt = build_source_prompt(config.project.name, doc)
            markdown = await run_text_agent(
                name="Source Summarizer",
                instructions=SOURCE_SUMMARIZER_INSTRUCTIONS,
                prompt=prompt,
                model=config.project.model,
                reasoning_effort=config.compile.reasoning_effort,
            )
            output_path = repo_paths.wiki_sources / f"{doc.source_id}.md"
            output_path.write_text(markdown.strip() + "\n", encoding="utf-8")

    await asyncio.gather(*(worker(doc) for doc in docs))


async def _compile_concepts(
    config: AppConfig, repo_paths: RepoPaths, source_summaries: list[SourceSummary]
) -> None:
    concept_map: dict[str, list[SourceSummary]] = defaultdict(list)
    for summary in source_summaries:
        for concept in summary.concepts:
            concept_map[concept].append(summary)

    semaphore = asyncio.Semaphore(config.compile.concurrency)

    async def worker(concept: str, summaries: list[SourceSummary]) -> None:
        async with semaphore:
            prompt = build_concept_prompt(concept, summaries)
            markdown = await run_text_agent(
                name="Concept Writer",
                instructions=CONCEPT_WRITER_INSTRUCTIONS,
                prompt=prompt,
                model=config.project.model,
                reasoning_effort=config.compile.reasoning_effort,
            )
            output_path = repo_paths.wiki_concepts / f"{slugify(concept)}.md"
            output_path.write_text(markdown.strip() + "\n", encoding="utf-8")

    await asyncio.gather(
        *(worker(concept, summaries) for concept, summaries in sorted(concept_map.items()))
    )


def _refresh_source_backlinks(source_dir: Path) -> None:
    summaries = _load_all_source_summaries(source_dir)
    concept_to_sources: dict[str, set[str]] = defaultdict(set)
    for summary in summaries:
        for concept in summary.concepts:
            concept_to_sources[concept].add(summary.source_id)

    related_by_source: dict[str, set[str]] = defaultdict(set)
    for source_ids in concept_to_sources.values():
        for source_id in source_ids:
            related_by_source[source_id].update(other for other in source_ids if other != source_id)

    for path in source_dir.glob("*.md"):
        content = path.read_text(encoding="utf-8")
        frontmatter, body = parse_frontmatter(content)
        source_id = str(frontmatter.get("source_id", path.stem))
        frontmatter["related_sources"] = sorted(related_by_source.get(source_id, set()))
        path.write_text(write_frontmatter(frontmatter, body), encoding="utf-8")


def _write_indexes(repo_paths: RepoPaths) -> None:
    source_summaries = _load_all_source_summaries(repo_paths.wiki_sources)
    concept_paths = sorted(repo_paths.wiki_concepts.glob("*.md"))

    source_lines = ["# Source Notes", ""]
    for summary in sorted(source_summaries, key=lambda item: item.title.lower()):
        concept_text = ", ".join(summary.concepts) or "none"
        source_lines.append(
            f"- [[sources/{summary.source_id}|{summary.title}]]"
            f" (`{summary.kind}`; concepts: {concept_text})"
        )
    (repo_paths.wiki_sources / "index.md").write_text(
        "\n".join(source_lines) + "\n", encoding="utf-8"
    )

    concept_lines = ["# Concept Pages", ""]
    for path in concept_paths:
        concept_lines.append(f"- [[concepts/{path.stem}|{path.stem.replace('-', ' ').title()}]]")
    (repo_paths.wiki_concepts / "index.md").write_text(
        "\n".join(concept_lines) + "\n", encoding="utf-8"
    )

    wiki_lines = [
        "# Living Knowledge Base",
        "",
        "## Start Here",
        "",
        "- [[sources/index|Source Notes]]",
        "- [[concepts/index|Concept Pages]]",
        "",
        "## Recent Sources",
        "",
    ]
    for summary in sorted(source_summaries, key=lambda item: item.title.lower())[:10]:
        wiki_lines.append(f"- [[sources/{summary.source_id}|{summary.title}]]")
    (repo_paths.wiki / "index.md").write_text(
        "\n".join(wiki_lines) + "\n", encoding="utf-8"
    )


def _write_search_index(repo_paths: RepoPaths) -> None:
    source_paths = sorted(repo_paths.wiki_sources.glob("*.md"))
    concept_paths = sorted(repo_paths.wiki_concepts.glob("*.md"))
    documents = build_documents(source_paths + concept_paths + [repo_paths.wiki / "index.md"])
    write_index(repo_paths.cache / SEARCH_INDEX_FILENAME, documents)


def _load_all_source_summaries(source_dir: Path) -> list[SourceSummary]:
    return [
        load_source_summary(path)
        for path in sorted(source_dir.glob("*.md"))
        if path.name != "index.md"
    ]


def _load_json(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))
