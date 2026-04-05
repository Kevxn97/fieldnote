from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from .config import KnowledgeBaseConfig
from .models import CatalogSnapshot, HealthFinding, SearchResult, WorkflowResult
from .prompts import TEAM_SYSTEM_PROMPT, ask_prompt, compile_prompt, heal_prompt


def _extract_response_text(response: Any) -> str:
    output = getattr(response, "output", None)
    if not output:
        return ""
    chunks: list[str] = []
    for item in output:
        if getattr(item, "type", None) != "message":
            continue
        for content in getattr(item, "content", []):
            if getattr(content, "type", None) == "output_text":
                chunks.append(getattr(content, "text", ""))
    return "\n".join(chunk for chunk in chunks if chunk).strip()


@dataclass(slots=True)
class OpenAIWorkflowClient:
    config: KnowledgeBaseConfig

    def __post_init__(self) -> None:
        if not self.config.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required for OpenAI workflows.")

        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover - depends on local env
            raise RuntimeError(
                "The `openai` package is not installed. Run `uv sync` first."
            ) from exc

        self._client = OpenAI(api_key=self.config.openai_api_key)

    def _respond(self, prompt: str) -> str:
        response = self._client.responses.create(
            model=self.config.model,
            instructions=TEAM_SYSTEM_PROMPT,
            input=prompt,
            reasoning={"effort": self.config.reasoning_effort},
        )
        return _extract_response_text(response)

    def compile(self, snapshot: CatalogSnapshot) -> WorkflowResult:
        context = json.dumps(snapshot.to_dict(), indent=2, ensure_ascii=True)
        text = self._respond(compile_prompt(context))
        return WorkflowResult(
            mode="openai",
            summary="OpenAI compile pipeline generated a wiki synthesis.",
            files_written=[],
            trace=["planner -> librarian -> editor"],
            content=text,
        )

    def ask(self, question: str, results: list[SearchResult]) -> WorkflowResult:
        context = json.dumps(
            [
                {
                    "title": result.record.title,
                    "path": result.record.rel_path,
                    "excerpt": result.record.excerpt,
                    "score": result.score,
                }
                for result in results
            ],
            indent=2,
            ensure_ascii=True,
        )
        text = self._respond(ask_prompt(question, context, output_format="markdown"))
        return WorkflowResult(
            mode="openai",
            summary="OpenAI Q&A team synthesized an answer.",
            files_written=[],
            trace=["retriever -> analyst -> editor"],
            content=text,
        )

    def heal(self, findings: list[HealthFinding]) -> WorkflowResult:
        context = json.dumps([finding.__dict__ for finding in findings], indent=2, ensure_ascii=True)
        text = self._respond(heal_prompt(context))
        return WorkflowResult(
            mode="openai",
            summary="OpenAI heal team reviewed the knowledge base.",
            files_written=[],
            trace=["auditor -> fixer -> editor"],
            content=text,
        )
