---
kind: "concept"
title: "Evaluator-optimizer"
concept: "Evaluator-optimizer"
source_count: 1
tags:
  - "concept"
---
# Evaluator-optimizer

## Definition
Evaluator-optimizer is a workflow pattern in Anthropic’s taxonomy of agentic systems: a predefined orchestration of LLM calls and tools, listed alongside prompt chaining, routing, parallelization, and orchestrator-workers as one of the common ways to add structured iteration beyond a single augmented LLM call.

## Description
Anthropic places evaluator-optimizer within **workflows**, not fully autonomous **agents**. In this framing, the process flow is defined in code ahead of time, while the model operates inside that structure. That distinguishes it from agent designs where the LLM dynamically decides its own sequence of steps and tool use.

The pattern appears in a broader progression from an **augmented LLM** to increasingly structured workflows and then to autonomous agents. Anthropic’s overall recommendation is to start with the simplest possible system—often a single optimized LLM call, retrieval, and in-context examples—and introduce workflow patterns like evaluator-optimizer only when they measurably improve outcomes.

The documented material ties workflow quality to disciplined system design rather than to elaborate frameworks. For evaluator-optimizer, the relevant design principles include explicit evaluation, transparent planning, good tool interfaces, environmental feedback, stopping conditions, and human checkpoints when tasks are high stakes.

Implementation details for evaluator-optimizer are not specified here beyond its inclusion as a standard workflow pattern. What is clear is that it belongs to the family of simple, composable orchestration patterns Anthropic highlights as practical building blocks.

## Why It Matters
Evaluator-optimizer matters because it represents a middle ground between a one-shot model call and a fully autonomous agent. That middle layer is important in practice: Anthropic argues that many reliable systems come from modest, structured orchestration rather than from maximal autonomy.

It also matters because Anthropic treats **evaluation** as central to reliability. Across agentic systems, the emphasis is on explicit evaluation, ground truth from the environment, and well-defined stopping conditions. A workflow pattern explicitly centered on evaluation and improvement fits that broader reliability-first approach.

The pattern is also relevant to cost and latency decisions. Anthropic warns that agentic complexity should not be added by default; workflows earn their place only when they demonstrably outperform simpler designs. Evaluator-optimizer therefore sits directly inside the tradeoff between better results and higher operational overhead.

Finally, it matters as part of a reusable vocabulary for system design. By naming evaluator-optimizer as a standard pattern, Anthropic gives teams a way to reason about structured LLM orchestration without jumping immediately to heavyweight frameworks or open-ended agents.

## Tensions And Debates
- How much additional orchestration evaluator-optimizer justifies compared with a single well-tuned augmented LLM call remains task-dependent.
- Workflow patterns improve structure, but they also add latency and cost; Anthropic explicitly treats that tradeoff as real rather than assuming more agentic design is always better.
- The pattern sits near the boundary between controlled workflows and more autonomous agents, raising design questions about how much discretion should remain in code versus in the model.
- Anthropic favors simple, composable patterns and direct API usage, which pushes against framework-heavy implementations that may obscure prompts, responses, and debugging.
- Reliability depends on explicit evaluation, feedback, and stopping conditions, but the material does not define a single standard evaluator-optimizer recipe for achieving those consistently.

## Open Questions
- What concrete task shapes most clearly favor evaluator-optimizer over prompt chaining, routing, parallelization, or orchestrator-workers?
- What evaluation criteria should determine whether evaluator-optimizer improves outcomes enough to justify extra cost and latency?
- Which stopping conditions are most effective for evaluator-optimizer loops in production systems?
- How should human-review checkpoints be inserted when evaluator-optimizer is used for high-stakes work?
- What tool interface designs make evaluator-optimizer workflows more reliable, especially in coding and other feedback-rich domains?
- How much environmental ground truth is necessary for evaluator-optimizer to outperform simpler workflows?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/building-effective-ai-agents]]

## Related Concepts
- [[wiki/concepts/agentic-systems]]
- [[wiki/concepts/augmented-llm]]
- [[wiki/concepts/prompt-chaining]]
- [[wiki/concepts/routing]]
- [[wiki/concepts/parallelization]]
- [[wiki/concepts/orchestrator-workers]]
- [[wiki/concepts/agent-computer-interface-aci]]
<!-- kb:concept-links:end -->
