---
kind: "concept"
title: "Routing"
concept: "Routing"
source_count: 1
tags:
  - "concept"
---
# Routing

## Definition
Routing is a workflow pattern in LLM-based systems in which task handling follows predefined code paths rather than fully model-directed control. In this context, it refers specifically to one of the common orchestration patterns used between a simple augmented LLM and a fully autonomous agent.

## Description
Routing appears in Anthropic’s taxonomy of agentic system design as one of five workflow patterns, alongside prompt chaining, parallelization, orchestrator-workers, and evaluator-optimizer. It belongs to the category of workflows, meaning the overall process structure is defined in code even when LLM calls and tools are involved.

Within that framing, routing is part of a broader progression from a single augmented LLM call toward more structured multi-step systems. The pattern is relevant when a direct prompt, retrieval, and in-context examples are not enough, but full agent autonomy would add unnecessary complexity.

The documented treatment of routing is intentionally pragmatic. It is not presented as a reason to introduce a heavy framework or a specialized abstraction layer. Instead, it fits the recommendation to compose simple patterns directly, keep prompts and tool behavior visible, and add complexity only when it clearly improves outcomes.

Routing also sits inside a larger design discipline for reliable AI systems: explicit evaluation, clear system structure, well-designed tools, and attention to latency and cost. As a workflow pattern, it inherits those constraints and is used under predefined orchestration rather than open-ended self-direction.

## Why It Matters
Routing matters because it offers a middle ground between a single LLM call and a fully autonomous agent. That makes it useful in cases where some structure is needed, but the higher cost, latency, and unpredictability of agentic autonomy are not justified.

It also matters because Anthropic treats workflow patterns as practical building blocks for production systems. The emphasis is on simple, composable designs that can be inspected and debugged, rather than opaque framework-driven behavior. In that environment, routing is part of a toolkit for controlled orchestration.

In operational terms, routing matters because reliability is tied to system design rather than to the label “agent.” A routed workflow can be evaluated explicitly, connected to tools, and bounded by code-level structure, which supports clearer debugging and more predictable behavior than unconstrained autonomy.

Routing is also important because choosing among workflow patterns is an active design decision. The documented material suggests that pattern choice should be driven by demonstrated performance gains, not by a default assumption that more agentic structure is better.

## Tensions And Debates
- Whether routing improves outcomes enough to justify added latency and cost compared with a single optimized LLM call is treated as an empirical question, not a default assumption.
- Routing sits near other workflow patterns, and the boundaries between it and alternatives such as prompt chaining or orchestrator-workers are not fully resolved in the material.
- The broader recommendation to avoid unnecessary frameworks creates a tradeoff: abstractions may speed development, but they can also obscure prompts, responses, and routing logic.
- Workflow-based routing offers predefined control, while fully autonomous agents offer model-directed flexibility; the right balance depends on the task and tolerance for complexity.
- Reliable routed systems still depend on strong tool design and evaluation, which means orchestration alone does not solve production failure modes.

## Open Questions
- What evaluation methods should determine when routing materially outperforms a simpler single-call design?
- How should developers choose routing over the other workflow patterns when a task could plausibly fit several of them?
- Which kinds of tasks show the clearest gains from routing under predefined orchestration?
- How should tool interfaces be designed so routed workflows remain easy for models to use and easy for developers to debug?
- What operational tradeoffs emerge when routing is implemented through direct API usage versus a framework layer?
- How much routing complexity is warranted before a system should instead move to a more agent-like design?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/building-effective-ai-agents]]

## Related Concepts
- [[wiki/concepts/agentic-systems]]
- [[wiki/concepts/augmented-llm]]
- [[wiki/concepts/prompt-chaining]]
- [[wiki/concepts/parallelization]]
- [[wiki/concepts/orchestrator-workers]]
- [[wiki/concepts/evaluator-optimizer]]
- [[wiki/concepts/agent-computer-interface-aci]]
<!-- kb:concept-links:end -->
