---
kind: "concept"
title: "**Manager pattern**"
concept: "**Manager pattern**"
source_count: 1
tags:
  - "concept"
---
# Manager pattern

## Definition
The manager pattern is a multi-agent orchestration approach in which a central manager agent controls workflow execution and delegates sub-tasks to specialized agents through tool calls, treating those agents as callable tools within explicit guardrails.

## Description
In this pattern, one agent remains responsible for overall coordination. It interprets the task, decides when delegation is needed, selects the appropriate subordinate capability, and continues the workflow until an exit condition is reached.

A key implementation detail is that agents can be exposed as tools to other agents. Under the manager pattern, the manager uses those agent-tools alongside other data, action, or orchestration tools, rather than handing control off permanently to peer agents.

The pattern belongs to the broader set of multi-agent designs, but it is not the default starting point. The documented guidance is to maximize a single agent’s capabilities first, then introduce a manager-based structure only when prompt logic becomes too complex or when overlapping tools create persistent tool-selection errors.

Because the manager remains the coordinating layer, its instructions and guardrails become especially important. It must route work clearly, apply policies consistently, and operate within the same layered safety model used for agent systems more generally, including moderation, tool safeguards, output validation, and human escalation for failures or high-risk actions.

## Why It Matters
The manager pattern provides a structured way to scale beyond a single agent without moving immediately to a fully decentralized system. It can separate high-level orchestration from specialized execution while preserving a clear point of control over the workflow.

This matters when a single prompt or toolset becomes unwieldy. If one agent has too many overlapping tools or increasingly complex instructions, delegation through a manager can reduce confusion in tool selection and make responsibilities more distinct.

It also supports reuse. Specialized agents can be packaged as tools and invoked when needed, allowing teams to standardize capabilities instead of rebuilding logic for each workflow. That fits the broader recommendation to build reusable, standardized tools and explicit routines.

Operationally, the pattern helps with governance. A central manager can enforce guardrails, determine when to invoke sensitive actions, and route ambiguous or risky cases toward human intervention, which is important for production use in consequential workflows.

## Tensions And Debates
- The main tradeoff is whether multi-agent orchestration is needed at all, since the recommended default is to strengthen a single agent before splitting responsibilities.
- A manager-centered design offers clearer control, but it may add orchestration overhead compared with a simpler single-agent loop.
- Using agents as tools increases modularity, but it can also introduce more layers where routing mistakes or failures can occur.
- The manager pattern competes with decentralized handoffs: centralized delegation keeps one coordinating authority, while peer handoffs may better fit workflows that need control to move between specialists.
- As delegation increases, instruction quality and guardrail design become more critical, creating a tradeoff between flexibility and operational predictability.

## Open Questions
- What level of prompt complexity should trigger a move from one agent to a manager-based multi-agent design?
- How much tool overlap or tool-selection error is enough to justify introducing a manager agent?
- What evaluation methods best measure whether a manager pattern improves reliability over a single-agent setup?
- How should layered guardrails be divided between the manager and the delegated agents?
- In production, when should a manager delegate to another agent versus use a non-agent tool directly?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/a-practical-guide-to-building-agents]]

## Related Concepts
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/single-agent-systems]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/human-intervention]]
<!-- kb:concept-links:end -->
