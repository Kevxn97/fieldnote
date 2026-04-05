from __future__ import annotations

from pathlib import Path

from .models import RawDocument, SearchHit, SourceSummary
from .utils import utc_timestamp


COMMON_OUTPUT_RULES = """
Rules:
- Only use the supplied source material.
- If the material is truncated or incomplete, say so explicitly.
- Do not invent URLs, datasets, file names, or citations.
- Prefer Obsidian-friendly wikilinks like [[sources/source-id]] or [[concepts/concept-slug]] when referencing repo pages.
- Keep wording compact, concrete, and evidence-rich.
""".strip()


SOURCE_SUMMARIZER_INSTRUCTIONS = f"""
You compile raw research artifacts into source notes for a living markdown wiki.

Return markdown only. The file must start with frontmatter in this exact shape:
---
title: "..."
source_id: "..."
source_path: "..."
kind: "..."
concepts: ["...", "..."]
related_sources: []
generated_at: "{utc_timestamp()}"
generated_by: "source-summarizer"
---

Then write these sections in order:
# Summary
# Key Points
# Open Questions
# Evidence

{COMMON_OUTPUT_RULES}
- In #Evidence, use 3-6 bullets grounded in the supplied excerpt.
- `concepts` should contain 2-6 reusable concept names, not sentence fragments.
- `related_sources` must stay empty; backlinks are computed by the host application.
""".strip()


CONCEPT_WRITER_INSTRUCTIONS = f"""
You synthesize cross-source concept pages for a markdown research wiki.

Return markdown only. The file must start with frontmatter:
---
title: "..."
concept: "..."
source_ids: ["...", "..."]
generated_at: "{utc_timestamp()}"
generated_by: "concept-writer"
kind: "concept"
---

Then write these sections in order:
# Why It Matters
# Synthesis
# Tensions
# Related Sources

{COMMON_OUTPUT_RULES}
- `source_ids` must only contain source IDs present in the prompt.
- In #Related Sources, use Obsidian wikilinks.
- Surface disagreements or ambiguities in #Tensions instead of smoothing them over.
""".strip()


ANSWER_RESEARCHER_INSTRUCTIONS = f"""
You are one member of a research team answering questions against a local markdown wiki.

Return markdown only with these sections:
# Thesis
# Evidence
# Unknowns

{COMMON_OUTPUT_RULES}
- Cite evidence with wikilinks to the supplied pages.
- Focus on a direct answer, not process narration.
""".strip()


ANSWER_SKEPTIC_INSTRUCTIONS = f"""
You are the skeptical reviewer in a multi-agent research team.

Return markdown only with these sections:
# Risks
# Contradictions
# Missing Evidence

{COMMON_OUTPUT_RULES}
- Prefer sharp, falsifiable critiques over generic caution.
""".strip()


ANSWER_MAPPER_INSTRUCTIONS = f"""
You are the librarian of a multi-agent research team.

Return markdown only with these sections:
# Relevant Files
# Concept Map
# Suggested Follow-ups

{COMMON_OUTPUT_RULES}
- Concentrate on navigation, clusters, and gaps in the local wiki.
""".strip()


FINAL_MARKDOWN_INSTRUCTIONS = f"""
You are the final editor for a local-first research knowledge base.

Return markdown only with these sections in order:
# Question
# Answer
# Evidence Trail
# Tensions And Unknowns
# Suggested Next Additions

{COMMON_OUTPUT_RULES}
- Use concise prose and short bullets.
- Keep the answer grounded in the supplied research-team notes and retrieved files.
""".strip()


FINAL_MARP_INSTRUCTIONS = f"""
You turn research notes into a Marp deck for viewing inside Obsidian.

Return only Marp markdown with this exact frontmatter:
---
marp: true
theme: default
paginate: true
---

Then produce a 5-8 slide deck with strong titles, short bullets, and one closing slide on open questions.

{COMMON_OUTPUT_RULES}
- Do not wrap the deck in code fences.
""".strip()


HEAL_LINT_INSTRUCTIONS = f"""
You lint a generated markdown wiki for structural and factual-health issues.

Return markdown only with these sections:
# Critical Issues
# Consistency Gaps
# Link Hygiene

{COMMON_OUTPUT_RULES}
- Focus on concrete problems that can be actioned by a future LLM pass.
""".strip()


HEAL_GROWTH_INSTRUCTIONS = f"""
You expand a generated markdown wiki by spotting missing connections and article candidates.

Return markdown only with these sections:
# New Article Candidates
# Missing Data To Fill
# High-Leverage Questions

{COMMON_OUTPUT_RULES}
- Prefer specific additions over vague brainstorming.
""".strip()


HEAL_EDITOR_INSTRUCTIONS = f"""
You edit wiki-health findings into a single actionable report.

Return markdown only with these sections:
# Wiki Health Report
# Must Fix Next
# Worth Exploring

{COMMON_OUTPUT_RULES}
""".strip()


def build_source_prompt(vault_name: str, doc: RawDocument) -> str:
    return f"""
Vault: {vault_name}
Source ID: {doc.source_id}
Relative path: {doc.relative_path}
Kind: {doc.kind}
Truncated input: {"yes" if doc.truncated else "no"}

Compile this raw source into a wiki source note.

Source excerpt:
{doc.excerpt}
""".strip()


def build_concept_prompt(concept: str, summaries: list[SourceSummary]) -> str:
    blocks = []
    for summary in summaries:
        blocks.append(
            "\n".join(
                [
                    f"Source ID: {summary.source_id}",
                    f"Title: {summary.title}",
                    f"Path: {summary.source_path}",
                    f"Concepts: {', '.join(summary.concepts)}",
                    "Body:",
                    summary.body,
                ]
            )
        )
    joined = "\n\n---\n\n".join(blocks)
    return f"""
Concept: {concept}
Create a concept page that synthesizes the following source notes.

Source notes:
{joined}
""".strip()


def build_research_prompt(question: str, hits: list[SearchHit], docs: list[str]) -> str:
    retrieved = []
    for hit, text in zip(hits, docs, strict=False):
        retrieved.append(
            "\n".join(
                [
                    f"Title: {hit.title}",
                    f"Path: {hit.path}",
                    f"Score: {hit.score:.2f}",
                    text,
                ]
            )
        )
    separator = "\n\n---\n\n"
    return f"""
Question: {question}

Retrieved wiki material:
{separator.join(retrieved)}
""".strip()


def build_final_answer_prompt(
    question: str,
    hits: list[SearchHit],
    researcher_notes: str,
    skeptic_notes: str,
    mapper_notes: str,
) -> str:
    hit_lines = "\n".join(f"- {hit.title} ({hit.path})" for hit in hits)
    return f"""
Question: {question}

Retrieved files:
{hit_lines}

Researcher notes:
{researcher_notes}

Skeptic notes:
{skeptic_notes}

Mapper notes:
{mapper_notes}
""".strip()


def build_heal_prompt(source_summaries: list[SourceSummary], concept_files: list[Path]) -> str:
    source_blocks = []
    for summary in source_summaries:
        source_blocks.append(
            f"- {summary.title} | {summary.source_id} | concepts={', '.join(summary.concepts)}"
        )
    concept_blocks = [f"- {path.stem}" for path in concept_files]
    nl = "\n"
    return f"""
Source note digest:
{nl.join(source_blocks)}

Concept page digest:
{nl.join(concept_blocks)}
""".strip()
