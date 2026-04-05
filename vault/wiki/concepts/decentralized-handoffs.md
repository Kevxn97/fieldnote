---
kind: "concept"
title: "**Decentralized handoffs**"
concept: "**Decentralized handoffs**"
source_count: 1
tags:
  - "concept"
---
# Decentralized handoffs

## Definition
Decentralized handoffs are a multi-agent orchestration pattern in which peer agents transfer execution to one another directly, instead of routing all delegation through a single manager agent.

## Description
In this pattern, work moves across multiple agents as the task requires different capabilities, contexts, or toolsets. Each agent participates as a peer in the workflow and can hand off execution when another agent is better suited for the next step.

Decentralized handoffs are presented as one of two main multi-agent patterns, alongside the manager pattern. The key distinction is control structure: a manager pattern centralizes delegation through one coordinating agent, while decentralized handoffs distribute that control across agents themselves.

This pattern becomes relevant when a single agent is no longer sufficient. A split into multiple agents is recommended only when prompt logic becomes too complex or when overlapping tools create persistent tool-selection errors. In that setting, decentralized handoffs offer a way to separate responsibilities without forcing every interaction through a central orchestrator.

The broader agent architecture still applies. Agents operate through models, tools, and instructions, and multi-agent systems may use orchestration tools, including cases where agents are exposed as tools to other agents.

## Why It Matters
Decentralized handoffs matter because they provide a way to scale beyond a single-agent design when workflow complexity increases. Rather than overloading one agent with too many instructions or too many similar tools, teams can divide work across specialized agents and let execution move between them.

They also matter as an alternative to centralized coordination. In systems where peer agents can transfer control directly, orchestration can more closely follow the structure of the work itself rather than forcing every decision through one manager.

This pattern is important operationally because the guidance does not treat multi-agent design as the default. Teams are advised to maximize a single agent first, then adopt patterns like decentralized handoffs only when complexity justifies the added coordination.

Decentralized handoffs also sit inside the same safety model as other agent systems. Guardrails, tool safeguards, output validation, and human intervention remain relevant, especially as control passes between agents and actions are taken on a user’s behalf.

## Tensions And Debates
- A single agent is the recommended starting point, so decentralized handoffs compete with a simpler default that is often preferable early on.
- Decentralized handoffs and the manager pattern solve similar multi-agent coordination problems but distribute control differently.
- Splitting into multiple agents can reduce prompt complexity, but it also introduces more orchestration structure than a single-agent loop.
- The threshold for moving from one agent to decentralized handoffs is not fixed; the documented triggers are prompt complexity and persistent tool-selection errors.
- Multi-agent flexibility must still be balanced against guardrails, validation, and human escalation for failures or high-risk actions.

## Open Questions
- What practical criteria should determine when prompt complexity is high enough to justify decentralized handoffs instead of refining a single agent?
- How should teams decide between decentralized handoffs and a manager pattern for the same workflow?
- What orchestration design works best when agents are exposed as tools to other agents in a decentralized system?
- How should guardrails be applied as execution passes from one peer agent to another?
- What evaluation methods most clearly show that decentralized handoffs outperform a single-agent design for a given task?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/a-practical-guide-to-building-agents]]

## Related Concepts
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/single-agent-systems]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/concepts/manager-pattern]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/human-intervention]]
<!-- kb:concept-links:end -->
