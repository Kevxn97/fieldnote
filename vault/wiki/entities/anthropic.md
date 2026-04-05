---
kind: "entity"
title: "Anthropic"
entity: "Anthropic"
source_count: 1
tags:
  - "entity"
---
# Anthropic

## Who Or What It Is
Anthropic is the organization credited as the author of *Building Effective AI Agents* and is described there as developing guidance for reliable LLM agent systems based on its own implementations and work with dozens of teams.

## Description
Anthropic presents a practical view of agentic system design that favors simple, composable patterns over heavy frameworks or specialized abstractions. Its stated recommendation is to begin with the simplest workable approach—often a single optimized LLM call with retrieval and in-context examples—and add workflow or agent complexity only when that complexity clearly improves results.

A central part of Anthropic’s framing is its distinction between **workflows** and **agents**. In this usage, workflows follow predefined code paths that orchestrate LLM calls and tools, while agents allow the model to dynamically direct process steps and tool use. Anthropic organizes this space as a progression from an augmented LLM through recurring workflow patterns and then to more autonomous agents.

Anthropic also emphasizes reliability and operational discipline. It argues that success depends less on abstract agent frameworks and more on explicit evaluation, transparent planning, strong tool interfaces, environmental feedback, stopping conditions, and human checkpoints. The article highlights tool design as a major practical concern and gives an example from Anthropic’s SWE-bench agent work, where changing from relative to absolute filepaths removed a recurring error mode.

The organization identifies some domains as especially promising for agentic systems, including customer support and coding agents. In these examples, Anthropic highlights the value of measurable outcomes and strong feedback loops such as action completion, tool results, or automated tests.

## Key Relationships
- **Building Effective AI Agents**: Authored by Anthropic and used to present its guidance on reliable agent design.
- **Agentic systems**: Anthropic argues these should usually be built from simple, composable patterns rather than heavy frameworks.
- **Workflows vs. agents**: Anthropic explicitly distinguishes predefined orchestration from model-directed control.
- **Augmented LLM**: Anthropic treats this as the foundational unit, with capabilities such as retrieval, tools, and memory.
- **Model Context Protocol**: Anthropic points to it as one way to integrate third-party tools.
- **SWE-bench agent work**: Anthropic cites this work as evidence that tool-interface details, such as absolute filepaths, can materially improve reliability.
- **Customer support and coding agents**: Anthropic identifies these as especially promising application areas for agentic systems.

## Open Questions
- What concrete evaluation process does Anthropic use to decide when extra workflow or agent complexity is worth the added latency and cost?
- What guardrails, sandboxing approaches, and recovery procedures has Anthropic found most effective in production agent deployments?
- How does Anthropic choose among prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer when multiple patterns could fit?
- What tradeoffs has Anthropic observed between Model Context Protocol integrations and custom tool integrations?
- Which stopping conditions and human-review checkpoints does Anthropic consider most effective for different autonomous-agent tasks?

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
- [[wiki/entities/claude-agent-sdk]]
- [[wiki/entities/model-context-protocol]]
- [[wiki/entities/strands-agents-sdk-by-aws]]
- [[wiki/entities/rivet]]
- [[wiki/entities/vellum]]
- [[wiki/entities/swe-bench-verified]]
- [[wiki/entities/claude-sonnet-45]]
<!-- kb:entity-links:end -->
