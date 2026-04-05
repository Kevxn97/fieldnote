---
kind: "concept"
title: "Agentic systems"
concept: "Agentic systems"
source_count: 1
tags:
  - "concept"
---
# Agentic systems

## Definition
Agentic systems are LLM-based systems that go beyond a single model call by combining models with tools, retrieval, memory, and multi-step control. The term is used broadly, but an important distinction is between **workflows**, where code defines the sequence of steps, and **agents**, where the model dynamically decides process steps and tool use.

## Description
Agentic systems are built on an **augmented LLM**: a model connected to capabilities such as retrieval, tools, and memory. From that base, they can range from relatively structured patterns to more autonomous behavior.

A common progression starts with simple workflow designs. Documented patterns include **prompt chaining**, **routing**, **parallelization**, **orchestrator-workers**, and **evaluator-optimizer**. These patterns keep control flow largely predefined in code while still using LLMs for generation, classification, decomposition, or critique.

At the more autonomous end, agents direct their own sequence of actions and select tools dynamically. In that setting, performance depends on environmental feedback at each step, such as tool outputs or code execution results, along with explicit stopping conditions and, in higher-stakes cases, human checkpoints.

In practice, these systems are described as working best when built from simple, composable parts rather than heavy abstractions. Tool interfaces also matter substantially: models perform better when tools are easy to invoke and return clear feedback.

## Why It Matters
Agentic systems matter because they can handle tasks that exceed what a single LLM call can do reliably. Multi-step decomposition, specialized routing, parallel work, and iterative evaluation can improve outcomes when tasks are complex, variable, or require external actions.

They are especially relevant where there is strong feedback from the environment. Customer support is one example, because success can involve both conversation and measurable resolution. Coding is another, because automated tests create a clear feedback loop for iterative improvement.

At the same time, they matter as a design discipline, not just as a product category. Reliability is tied to evaluation, transparent planning, good tool design, and operational controls rather than to the mere presence of an “agent” label.

They also matter because they introduce real tradeoffs. More agentic designs can improve performance, but they often cost more and take longer, so they are not the default answer for every use case.

## Tensions And Debates
- The term **agentic systems** is broad, but there is a meaningful split between **workflows** with predefined control flow and **agents** with model-directed control.
- Greater autonomy can improve task performance, but it also increases **latency** and **cost**.
- Heavy frameworks may speed initial assembly, but they can obscure prompts and responses, complicate debugging, and encourage unnecessary complexity.
- Simpler single-call or lightly augmented systems are often sufficient, creating a recurring tradeoff between elegance of design and added orchestration.
- Tool richness expands capability, but poorly designed tool interfaces create failure modes; tool design competes with prompt design for optimization effort.
- Autonomous operation is attractive, but dependable behavior appears to require explicit stopping conditions, environmental ground truth, and often human review.

## Open Questions
- How should teams decide when a workflow or agent improves outcomes enough to justify added cost and latency?
- Which evaluation methods are most effective for comparing simple augmented LLMs, workflows, and more autonomous agents?
- How should developers choose among prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer when a task fits multiple patterns?
- Which stopping conditions and human-review checkpoints work best for different classes of autonomous tasks?
- What operational tradeoffs arise between Model Context Protocol integrations and custom tool integrations?
- Beyond customer support and coding, which domains show strong evidence that open-ended agents outperform simpler workflows?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/building-effective-ai-agents]]

## Related Concepts
- [[wiki/concepts/augmented-llm]]
- [[wiki/concepts/prompt-chaining]]
- [[wiki/concepts/routing]]
- [[wiki/concepts/parallelization]]
- [[wiki/concepts/orchestrator-workers]]
- [[wiki/concepts/evaluator-optimizer]]
- [[wiki/concepts/agent-computer-interface-aci]]
<!-- kb:concept-links:end -->
