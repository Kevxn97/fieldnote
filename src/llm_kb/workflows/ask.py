from __future__ import annotations

from pathlib import Path
import asyncio

from ..config import AppConfig
from ..openai_runtime import run_text_agent
from ..paths import RepoPaths
from ..prompts import (
    ANSWER_MAPPER_INSTRUCTIONS,
    ANSWER_RESEARCHER_INSTRUCTIONS,
    ANSWER_SKEPTIC_INSTRUCTIONS,
    FINAL_MARKDOWN_INSTRUCTIONS,
    FINAL_MARP_INSTRUCTIONS,
    build_final_answer_prompt,
    build_research_prompt,
)
from ..search import load_index, search_documents
from ..utils import date_slug, slugify


SEARCH_INDEX_FILENAME = "search-index.json"


async def answer_question(
    config: AppConfig, question: str, output_format: str = "markdown"
) -> Path:
    repo_paths = RepoPaths.from_config(config)
    index_path = repo_paths.cache / SEARCH_INDEX_FILENAME
    documents = load_index(index_path)
    if not documents:
        raise RuntimeError("Search index not found. Run `lkb compile` first.")

    hits = search_documents(documents, question, top_k=config.ask.top_k)
    if not hits:
        raise RuntimeError("No relevant wiki pages were found. Add sources and run `lkb compile`.")

    doc_texts = [
        Path(hit.path).read_text(encoding="utf-8", errors="ignore")
        for hit in hits
    ]
    research_prompt = build_research_prompt(question, hits, doc_texts)

    researcher_task = run_text_agent(
        name="Researcher",
        instructions=ANSWER_RESEARCHER_INSTRUCTIONS,
        prompt=research_prompt,
        model=config.project.model,
        reasoning_effort=config.ask.reasoning_effort,
    )
    skeptic_task = run_text_agent(
        name="Skeptic",
        instructions=ANSWER_SKEPTIC_INSTRUCTIONS,
        prompt=research_prompt,
        model=config.project.model,
        reasoning_effort=config.ask.reasoning_effort,
    )
    mapper_task = run_text_agent(
        name="Mapper",
        instructions=ANSWER_MAPPER_INSTRUCTIONS,
        prompt=research_prompt,
        model=config.project.model,
        reasoning_effort=config.ask.reasoning_effort,
    )
    researcher_notes, skeptic_notes, mapper_notes = await asyncio.gather(
        researcher_task, skeptic_task, mapper_task
    )

    final_prompt = build_final_answer_prompt(
        question, hits, researcher_notes, skeptic_notes, mapper_notes
    )
    instructions = (
        FINAL_MARP_INSTRUCTIONS if output_format == "marp" else FINAL_MARKDOWN_INSTRUCTIONS
    )
    final_output = await run_text_agent(
        name="Editor",
        instructions=instructions,
        prompt=final_prompt,
        model=config.project.model,
        reasoning_effort=config.ask.reasoning_effort,
        verbosity="medium",
    )
    target_dir = (
        repo_paths.outputs_slides if output_format == "marp" else repo_paths.outputs_answers
    )
    suffix = ".md"
    output_path = target_dir / f"{date_slug()}-{slugify(question)[:60]}{suffix}"
    output_path.write_text(final_output.strip() + "\n", encoding="utf-8")
    return output_path
