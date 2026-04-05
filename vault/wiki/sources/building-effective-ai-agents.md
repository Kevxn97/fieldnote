---
kind: "source"
title: "Building Effective AI Agents"
source_id: "src_building-effective-ai-agents_e55112e9"
source_kind: "text"
raw_path: "raw/clips/building-effective-ai-agents.md"
source_url: "https://www.anthropic.com/engineering/building-effective-agents"
authors:
  - "Anthropic"
published: "2024-12-19"
created: "2026-04-05"
description: "Discover how Anthropic approaches the development of reliable AI agents. Learn about our research on agent capabilities, safety considerations, and technical framework for building trustworthy AI."
source_tags:
  - "clippings"
related_assets:
tags:
  - "source"
  - "text"
---
# Building Effective AI Agents

## Summary
Anthropic argues that effective LLM agent systems are usually built from simple, composable patterns rather than heavy frameworks or highly specialized abstractions. Based on work with dozens of teams and Anthropic’s own implementations, the post recommends starting with the simplest possible design—often a single optimized LLM call with retrieval and in-context examples—and adding workflow or agent complexity only when it demonstrably improves results.

The article draws a clear distinction between **workflows** and **agents**. Workflows follow predefined code paths that orchestrate LLM calls and tools, while agents let the LLM dynamically choose process steps and tool use. Anthropic presents a progression from an **augmented LLM** to five common workflow patterns—prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer—before discussing fully autonomous agents.

A core practical theme is that reliability depends less on abstract “agent frameworks” and more on careful system design: explicit evaluation, transparent planning, good tool interfaces, environmental feedback, stopping conditions, and human checkpoints. The post also emphasizes that tool design deserves the same level of prompt-engineering attention as prompts themselves, especially for coding agents and other high-stakes tasks.

## Key Points
- Anthropic defines **workflows** as predefined orchestration of LLMs and tools, and **agents** as systems where the LLM dynamically directs its own process and tool usage.
- The recommended default is to **avoid unnecessary agentic complexity**: optimize simple prompts first, then use workflows or agents only if they clearly improve outcomes despite higher latency and cost.
- Anthropic advises developers to **start with direct LLM API usage** rather than frameworks, because frameworks can obscure prompts and responses, complicate debugging, and encourage unnecessary complexity.
- The foundational unit is an **augmented LLM** with capabilities such as retrieval, tools, and memory; the post points to **Model Context Protocol** as one way to integrate third-party tools.
- The five workflow patterns described are **prompt chaining**, **routing**, **parallelization** (sectioning and voting), **orchestrator-workers**, and **evaluator-optimizer**, each suited to different task structures.
- For autonomous agents, Anthropic stresses the need for **ground truth from the environment** at each step, such as tool-call results or code execution, plus **human feedback checkpoints** and stopping conditions like maximum iteration limits.
- Appendix examples highlight two especially promising domains: **customer support**, where conversation plus action and measurable resolution matter, and **coding agents**, where automated tests provide strong feedback loops.
- In tool design, Anthropic recommends formats that are easy for models to generate, minimizing formatting overhead; in its SWE-bench agent work, switching from **relative** to **absolute filepaths** eliminated a recurring error mode.

## Entities
- Anthropic
- Claude Agent SDK
- Model Context Protocol
- Strands Agents SDK by AWS
- Rivet
- Vellum
- SWE-bench Verified
- Claude Sonnet 4.5

## Concepts
- Agentic systems
- Augmented LLM
- Prompt chaining
- Routing
- Parallelization
- Orchestrator-workers
- Evaluator-optimizer
- Agent-computer interface (ACI)

## Contradictions And Updates
- Refines the broad use of the term **agent** by splitting agentic systems into two architectures: **workflows** with predefined code paths and **agents** with model-directed control.
- Pushes back on the idea that better LLM products require more sophisticated frameworks: Anthropic says many successful systems are built with **simple, composable patterns** and direct API usage.
- Challenges the assumption that autonomy is always desirable: the post explicitly says agentic systems trade **latency and cost** for performance, and that simpler single-call approaches are often sufficient.
- Updates prompt-engineering practice by arguing that **tool definitions and tool interfaces** deserve as much optimization effort as top-level prompts, especially in production agents.

## Open Questions
- What concrete evaluation methods does Anthropic use to decide when a workflow or agent “demonstrably improves outcomes” enough to justify extra cost and latency?
- What specific guardrails, sandbox setups, and failure-recovery procedures have worked best in Anthropic’s production agent deployments?
- How should developers choose between the five workflow patterns when a task could plausibly fit more than one pattern?
- What operational tradeoffs has Anthropic observed when using **Model Context Protocol** versus custom tool integrations?
- Which stopping conditions and human-review checkpoints are most effective for different classes of autonomous agent tasks?
- Beyond the cited examples, what other domains have shown strong evidence that open-ended agents outperform simpler workflows?

## Raw References
- raw/clips/building-effective-ai-agents.md

<!-- kb:source-links:start -->
## Knowledge Graph
- Source: [[wiki/sources/building-effective-ai-agents]]
- Raw: [[raw/clips/building-effective-ai-agents]]
- [[wiki/entities/anthropic]]
- [[wiki/entities/claude-agent-sdk]]
- [[wiki/entities/model-context-protocol]]
- [[wiki/entities/strands-agents-sdk-by-aws]]
- [[wiki/entities/rivet]]
- [[wiki/entities/vellum]]
- [[wiki/entities/swe-bench-verified]]
- [[wiki/entities/claude-sonnet-45]]
- [[wiki/concepts/agentic-systems]]
- [[wiki/concepts/augmented-llm]]
- [[wiki/concepts/prompt-chaining]]
- [[wiki/concepts/routing]]
- [[wiki/concepts/parallelization]]
- [[wiki/concepts/orchestrator-workers]]
- [[wiki/concepts/evaluator-optimizer]]
- [[wiki/concepts/agent-computer-interface-aci]]
<!-- kb:source-links:end -->
