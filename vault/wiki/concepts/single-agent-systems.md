---
kind: "concept"
title: "**Single-agent systems**"
concept: "**Single-agent systems**"
source_count: 1
tags:
  - "concept"
---
# Single-agent systems

## Definition
Single-agent systems are agent architectures in which one LLM-driven agent manages the workflow for a task, uses available tools to gather information or take actions, and operates within explicit instructions and guardrails until an exit condition is reached.

## Description
In this usage, a single-agent system is not just a chatbot or a one-off model call. It is an agent that controls workflow execution on a user’s behalf, deciding when to use tools, incorporating context, and progressing through a task with some independence.

A typical single-agent design is built from three core elements: the model, the tools, and the instructions. The model provides reasoning and decision-making, the tools let the agent read data or perform actions, and the instructions translate policies or procedures into explicit routines the agent can follow.

The runtime pattern is usually a loop. The agent continues until it reaches a defined stopping point, such as issuing a final-output tool call, returning a direct answer without further tool use, encountering an error, or hitting a maximum-turn limit.

Single-agent systems are treated as the default starting point for agentic workflows. They can cover substantial complexity before any split into multiple specialized agents is needed, especially when tools are standardized and instructions are clear about branching logic and edge cases.

## Why It Matters
Single-agent systems matter because they are the recommended baseline for building agents. Rather than starting with multi-agent orchestration, the documented approach is to first push a single agent as far as it can go with the right model, tools, instructions, and guardrails.

This matters operationally because many useful agent applications involve nuanced judgment, unstructured data, or rules that are difficult to maintain deterministically. A single agent can often handle these workflows without the overhead of coordinating several agents.

They also provide a cleaner path for iteration. Teams can prototype with the most capable model, establish performance through evals, and then optimize for cost and latency by selectively moving parts of the workload to smaller models if the baseline holds.

Single-agent systems also simplify deployment and safety design. Guardrails such as moderation, PII filtering, tool safeguards, output validation, and human escalation can be layered around one decision-making loop before introducing the added complexity of delegation or handoffs.

## Tensions And Debates
- A single agent is the recommended default, but there is a practical limit: prompt logic can become too complex for one agent to manage cleanly.
- Keeping many tools under one agent simplifies architecture, yet too much tool overlap can lead to persistent tool-selection errors.
- Code-first orchestration can stay flexible for dynamic workflows, but explicit graph-style control may still appeal where teams want every branch and loop predefined.
- Starting with the most capable model improves the chance of meeting accuracy targets, but it creates immediate pressure to reduce cost and latency later.
- Greater single-agent autonomy increases usefulness, but it also raises the need for stronger guardrails and human intervention for failures or high-risk actions.

## Open Questions
- What evaluation methods and metrics are most appropriate for establishing a reliable performance baseline for a single-agent system?
- How complex must prompt logic become before splitting a single agent into multiple agents is justified?
- How much tool count or tool similarity is enough to predict recurring tool-selection failure in one-agent designs?
- What risk criteria should determine which tools a single agent may use autonomously and which require tighter controls?
- What human-in-the-loop operating model is most effective during early deployment of single-agent systems?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/a-practical-guide-to-building-agents]]

## Related Concepts
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/concepts/manager-pattern]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/human-intervention]]
<!-- kb:concept-links:end -->
