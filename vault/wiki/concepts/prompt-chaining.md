---
kind: "concept"
title: "Prompt chaining"
concept: "Prompt chaining"
source_count: 1
tags:
  - "concept"
---
# Prompt chaining

## Definition
Prompt chaining is a workflow pattern in which multiple LLM prompts are connected through predefined code paths. In Anthropic’s framing, it belongs to the workflow class of agentic systems rather than autonomous agents: the sequence is orchestrated by software, not dynamically directed by the model itself.

## Description
Prompt chaining is one of five common workflow patterns identified alongside routing, parallelization, orchestrator-workers, and evaluator-optimizer. It sits in a progression that starts with an augmented LLM and moves toward more structured orchestration only when a single optimized model call is not enough.

As a workflow pattern, prompt chaining inherits the defining properties of workflows generally: predefined orchestration of LLM calls and tools. That distinguishes it from agents, where the model decides its own process steps and tool usage at runtime.

The term can be used broadly to mean any sequence of prompts, but in this usage it has a narrower meaning: a composable, code-directed pattern for structuring LLM work. It can be combined with the capabilities of an augmented LLM, including retrieval, tools, and memory.

Anthropic places prompt chaining inside a practical design philosophy that favors simple, inspectable building blocks over heavy frameworks. The emphasis is on direct API usage, transparent behavior, and adding structured steps only when they demonstrably improve outcomes.

## Why It Matters
Prompt chaining matters because it offers a middle ground between a single LLM call and a fully autonomous agent. For tasks that need more structure than one prompt can provide, it gives developers a way to add coordination without giving up control over the execution path.

It also aligns with a reliability-first approach. Because the flow is predefined, developers can evaluate behavior more explicitly, inspect prompts and responses more directly, and avoid some of the debugging difficulty that can come with abstract agent frameworks.

In production systems, extra structure is only valuable if it improves results enough to justify higher latency and cost. Prompt chaining is important precisely because it is a relatively simple pattern in that tradeoff space: more structured than a single call, but less open-ended than model-directed autonomy.

The pattern also fits Anthropic’s broader guidance that system quality depends on design details rather than on the label “agent.” Careful prompt design, tool interfaces, environmental feedback, and clear stopping logic all matter more than adopting a complex framework.

## Tensions And Debates
- Simplicity versus structure: a single optimized LLM call is often sufficient, so prompt chaining must justify its added latency and cost.
- Workflow versus agent autonomy: prompt chaining preserves developer control, but that can limit flexibility compared with model-directed agents.
- Direct API usage versus frameworks: frameworks may accelerate development, but they can obscure prompts and responses and make chained behavior harder to debug.
- Composability versus overengineering: prompt chaining is presented as a useful building block, yet unnecessary workflow complexity is discouraged.
- Pattern selection remains fuzzy: some tasks may plausibly fit prompt chaining or another workflow pattern such as routing or evaluator-optimizer.

## Open Questions
- What evaluation methods are most useful for deciding when prompt chaining improves outcomes enough to justify its extra cost and latency?
- How should developers choose between prompt chaining and the other workflow patterns for tasks with overlapping structure?
- Which kinds of tasks benefit most from prompt chaining before a team should consider a more autonomous agent design?
- How should retrieval, memory, and tool use be incorporated into chained prompts without making the workflow unnecessarily complex?
- What prompt and tool-interface practices most improve the reliability of chained workflows in production?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/building-effective-ai-agents]]

## Related Concepts
- [[wiki/concepts/agentic-systems]]
- [[wiki/concepts/augmented-llm]]
- [[wiki/concepts/routing]]
- [[wiki/concepts/parallelization]]
- [[wiki/concepts/orchestrator-workers]]
- [[wiki/concepts/evaluator-optimizer]]
- [[wiki/concepts/agent-computer-interface-aci]]
<!-- kb:concept-links:end -->
