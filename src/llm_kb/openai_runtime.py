from __future__ import annotations

import os
from typing import Any


def require_openai_key() -> None:
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Copy .env.example to .env, export the key, then rerun."
        )


def _load_agents_sdk() -> tuple[Any, Any, Any, Any]:
    try:
        from agents import Agent, ModelSettings, Runner
        from openai.types.shared import Reasoning
    except ImportError as exc:
        raise RuntimeError(
            "The OpenAI Agents SDK is not installed. Run `uv sync` first."
        ) from exc
    return Agent, ModelSettings, Runner, Reasoning


async def run_text_agent(
    *,
    name: str,
    instructions: str,
    prompt: str,
    model: str,
    reasoning_effort: str,
    verbosity: str = "low",
) -> str:
    require_openai_key()
    Agent, ModelSettings, Runner, Reasoning = _load_agents_sdk()
    agent = Agent(
        name=name,
        instructions=instructions,
        model=model,
        model_settings=ModelSettings(
            reasoning=Reasoning(effort=reasoning_effort),
            verbosity=verbosity,
        ),
    )
    result = await Runner.run(agent, prompt)
    output = result.final_output
    if isinstance(output, str):
        return output
    return str(output)
