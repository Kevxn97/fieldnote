---
kind: "entity"
title: "Claude Agent SDK"
entity: "Claude Agent SDK"
source_count: 1
tags:
  - "entity"
---
# Claude Agent SDK

## Who Or What It Is
Claude Agent SDK is an Anthropic-related software development kit named in connection with Anthropic’s guidance on building LLM agents. The available evidence places it in the ecosystem of agentic systems, tools, and frameworks, but does not describe its capabilities or implementation details directly.

## Description
Anthropic’s guidance on effective agents emphasizes simple, composable system design over heavy abstraction. In that context, Claude Agent SDK appears as one of the named entities associated with agent-building practice around Claude, alongside concepts such as augmented LLMs, workflows, and autonomous agents.

The surrounding guidance draws a strong distinction between **workflows** and **agents**. Workflows follow predefined code paths, while agents let the model dynamically choose steps and tool use. Claude Agent SDK is therefore most plausibly related to building systems in that design space, but the summarized evidence does not specify whether it targets workflows, autonomous agents, or both.

Anthropic also recommends starting with direct LLM API usage before adopting frameworks, because frameworks can hide prompts and responses and make debugging harder. That recommendation matters to how Claude Agent SDK should be understood: if it is used for agent construction, Anthropic’s broader position suggests it should be evaluated against simpler direct-API approaches rather than assumed necessary by default.

## Key Relationships
- **Anthropic** — Claude Agent SDK is named in Anthropic material about building effective AI agents.
- **Agentic systems** — It is associated with the broader category of systems built from LLM calls, tools, retrieval, and memory.
- **Workflows vs. agents** — Its relevance is framed by Anthropic’s distinction between predefined orchestration and model-directed autonomy.
- **Augmented LLM** — The article treats augmented LLMs as the foundational unit of agent systems; Claude Agent SDK is adjacent to that architecture.
- **Model Context Protocol** — MCP is cited as a way to integrate third-party tools, which may be relevant to systems built with or around Claude Agent SDK.
- **Direct LLM API usage** — Anthropic recommends trying direct API implementations first, implying Claude Agent SDK is not presented as a mandatory layer.
- **Other agent-building tools** — Strands Agents SDK by AWS, Rivet, and Vellum are also named in the same source, placing Claude Agent SDK among agent-development tooling and frameworks.

## Open Questions
- What concrete functionality Claude Agent SDK provides is not described in the available evidence.
- Whether Claude Agent SDK is intended primarily for workflows, autonomous agents, or both remains unclear.
- The extent to which it abstracts or exposes prompts, tool calls, and model responses is not specified.
- It is unknown how Claude Agent SDK relates operationally to Anthropic’s recommendation to begin with direct API usage.
- No details are given about its support for tool integration, memory, retrieval, or MCP.
- The summarized material does not say how Claude Agent SDK compares with other named tools such as Strands Agents SDK, Rivet, or Vellum.

<!-- kb:entity-links:start -->
## Evidence Links
- [[wiki/sources/building-effective-ai-agents]]

## Related Concepts
- [[wiki/concepts/agentic-systems]]
- [[wiki/concepts/augmented-llm]]
- [[wiki/concepts/prompt-chaining]]
- [[wiki/concepts/routing]]
- [[wiki/concepts/parallelization]]
- [[wiki/concepts/orchestrator-workers]]
- [[wiki/concepts/evaluator-optimizer]]
- [[wiki/concepts/agent-computer-interface-aci]]

## Related Entities
- [[wiki/entities/anthropic]]
- [[wiki/entities/model-context-protocol]]
- [[wiki/entities/strands-agents-sdk-by-aws]]
- [[wiki/entities/rivet]]
- [[wiki/entities/vellum]]
- [[wiki/entities/swe-bench-verified]]
- [[wiki/entities/claude-sonnet-45]]
<!-- kb:entity-links:end -->
