---
kind: "source"
title: "A practical guide to building agents"
source_id: "src_a-practical-guide-to-building-agents_701c344e"
source_kind: "text"
raw_path: "raw/clips/a-practical-guide-to-building-agents.md"
source_url: "https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/"
published: "2026-04-02"
created: "2026-04-05"
description: "A comprehensive guide to designing, orchestrating, and deploying AI agents—covering use cases, model selection, tool design, guardrails, and multi-agent patterns."
source_tags:
  - "clippings"
related_assets:
tags:
  - "source"
  - "text"
---
# A practical guide to building agents

## Summary
This guide defines **agents** as systems that use an LLM to independently accomplish tasks on a user’s behalf by managing workflow execution, selecting tools, and operating within explicit guardrails. It distinguishes agents from simpler LLM applications such as single-turn chatbots or sentiment classifiers that do not control workflows.

The source argues that agents are most useful where deterministic automation breaks down: workflows with nuanced judgment, hard-to-maintain rules, or heavy reliance on unstructured data. Its examples include fraud analysis, customer-service refund approval, vendor security reviews, and home insurance claim processing.

It frames agent design around three building blocks: **models**, **tools**, and **instructions**. The guide recommends starting with the most capable model to establish a performance baseline, then optimizing for cost and latency with smaller models where possible; building reusable, standardized tools; and converting existing policies or procedures into explicit agent routines.

The guide also emphasizes incremental deployment. It recommends maximizing a single agent’s capabilities before introducing multi-agent orchestration, then using either a **manager pattern** or **decentralized handoffs** when complexity requires it. Safety is treated as a layered system of guardrails, moderation, tool safeguards, output validation, and human intervention for failures or high-risk actions.

## Key Points
- An agent must both use an LLM to manage workflow execution and have access to tools that let it gather context or take actions within defined guardrails.
- The source recommends building agent prototypes with the most capable model first, using evals to establish a baseline before replacing larger models with smaller ones to reduce cost and latency.
- Tools are grouped into three types: **data** tools, **action** tools, and **orchestration** tools, including cases where agents themselves are exposed as tools to other agents.
- High-quality instructions should be explicit, action-oriented, derived from existing procedures where possible, and designed to handle edge cases and branching logic.
- A single-agent loop should run until an exit condition is reached, such as a final-output tool call, a direct model response without tool calls, an error, or a maximum-turn limit.
- The guide recommends starting with a single agent and only splitting into multiple agents when prompt logic becomes too complex or tool overlap causes persistent tool-selection errors.
- It describes two multi-agent patterns: a **manager** agent that delegates via tool calls, and a **decentralized** system where peer agents hand off execution to one another.
- Guardrails should be layered and can include relevance classifiers, safety classifiers, PII filtering, moderation, tool risk ratings, rules-based protections, output validation, and human escalation.

## Entities
- **OpenAI**
- **Agents SDK**
- **OpenAI moderation API**
- **o1**
- **o3-mini**
- **WebSearchTool**

## Concepts
- **AI agents**
- **Workflow execution**
- **Single-agent systems**
- **Multi-agent systems**
- **Manager pattern**
- **Decentralized handoffs**
- **Guardrails**
- **Human intervention**

## Contradictions And Updates
- The source narrows the definition of an “agent”: an LLM application is **not** an agent unless it actually controls workflow execution and can use tools to act on the user’s behalf.
- It pushes back on the instinct to start with a fully autonomous multi-agent architecture; the recommended default is to maximize a single agent with tools first.
- It updates model-selection practice away from premature optimization: first meet accuracy targets with the strongest available models, then swap in smaller models selectively.
- It qualifies the value of declarative graph-based orchestration by arguing that explicitly defining every branch and loop can become cumbersome for dynamic workflows, while a code-first approach can stay more adaptable.

## Open Questions
- What specific evaluation methods and metrics does the guide assume when establishing an agent performance baseline?
- How should teams decide the exact threshold at which tool count or tool similarity justifies splitting one agent into several?
- What concrete risk criteria should determine whether a tool is rated low, medium, or high in a given production environment?
- How should organizations choose between API-based tools and computer-use models for legacy systems with weak or missing integrations?
- What human-in-the-loop operating model works best during early deployment, beyond the general advice to escalate high-risk actions and repeated failures?

## Raw References
- `raw/clips/a-practical-guide-to-building-agents.md`

<!-- kb:source-links:start -->
## Knowledge Graph
- Source: [[wiki/sources/a-practical-guide-to-building-agents]]
- Raw: [[raw/clips/a-practical-guide-to-building-agents]]
- [[wiki/entities/openai]]
- [[wiki/entities/agents-sdk]]
- [[wiki/entities/openai-moderation-api]]
- [[wiki/entities/o1]]
- [[wiki/entities/o3-mini]]
- [[wiki/entities/websearchtool]]
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/single-agent-systems]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/concepts/manager-pattern]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/human-intervention]]
<!-- kb:source-links:end -->
