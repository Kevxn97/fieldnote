from __future__ import annotations

from pathlib import Path
import asyncio

from ..config import AppConfig
from ..openai_runtime import run_text_agent
from ..paths import RepoPaths
from ..prompts import (
    HEAL_EDITOR_INSTRUCTIONS,
    HEAL_GROWTH_INSTRUCTIONS,
    HEAL_LINT_INSTRUCTIONS,
    build_heal_prompt,
)
from ..workflows.compile import _load_all_source_summaries
from ..utils import date_slug


async def heal_wiki(config: AppConfig) -> Path:
    repo_paths = RepoPaths.from_config(config)
    source_summaries = _load_all_source_summaries(repo_paths.wiki_sources)
    concept_files = sorted(repo_paths.wiki_concepts.glob("*.md"))
    if not source_summaries:
        raise RuntimeError("No source notes found. Run `lkb compile` first.")

    prompt = build_heal_prompt(source_summaries, concept_files)
    lint_task = run_text_agent(
        name="Wiki Linter",
        instructions=HEAL_LINT_INSTRUCTIONS,
        prompt=prompt,
        model=config.project.model,
        reasoning_effort=config.heal.reasoning_effort,
    )
    growth_task = run_text_agent(
        name="Wiki Growth Scout",
        instructions=HEAL_GROWTH_INSTRUCTIONS,
        prompt=prompt,
        model=config.project.model,
        reasoning_effort=config.heal.reasoning_effort,
    )
    lint_notes, growth_notes = await asyncio.gather(lint_task, growth_task)

    editor_prompt = f"""
Lint findings:
{lint_notes}

Growth findings:
{growth_notes}
""".strip()
    report = await run_text_agent(
        name="Wiki Health Editor",
        instructions=HEAL_EDITOR_INSTRUCTIONS,
        prompt=editor_prompt,
        model=config.project.model,
        reasoning_effort=config.heal.reasoning_effort,
    )
    output_path = repo_paths.outputs_reports / f"{date_slug()}-wiki-health.md"
    output_path.write_text(report.strip() + "\n", encoding="utf-8")
    return output_path
