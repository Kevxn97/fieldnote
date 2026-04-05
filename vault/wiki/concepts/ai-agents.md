---
kind: "concept"
title: "**AI agents**"
concept: "**AI agents**"
source_count: 1
tags:
  - "concept"
---
# AI agents

## Definition
AI agents are LLM-based systems that independently accomplish tasks on a user’s behalf by managing workflow execution, selecting and using tools to gather context or take actions, and operating within explicit guardrails. The term is used more loosely in practice, but in this usage it excludes simpler LLM applications that generate responses without actually controlling a workflow.

## Description
An AI agent combines three core elements: a model, tools, and instructions. The model provides reasoning and judgment, the tools let the agent retrieve information or act in external systems, and the instructions define the routines, policies, and edge-case behavior the agent should follow.

Agents are most applicable when deterministic automation is hard to maintain. They are suited to workflows that depend on nuanced judgment, unstructured information, or branching decisions that would otherwise require large rule sets. Documented examples include fraud analysis, refund approval, vendor security review, and insurance claims processing.

A common baseline is a single-agent loop that continues until an exit condition is reached, such as a final-output tool call, a direct model response, an error, or a maximum-turn limit. The recommended design pattern is to maximize one agent’s capabilities before introducing multiple specialized agents.

When one agent becomes too complex, multi-agent designs can split responsibility. Two patterns are described: a manager pattern, where one agent delegates work through tool calls, and decentralized handoffs, where peer agents transfer execution among themselves. In both cases, agents remain bounded by layered safeguards and may escalate to humans for high-risk actions or failure cases.

## Why It Matters
AI agents matter because they address operational gaps where fixed workflows break down. In domains with ambiguous inputs, policy interpretation, or messy data, they offer a way to automate work that is difficult to capture with rigid if-then logic.

They also change how automation is built. Instead of encoding every branch manually, teams can rely on models for workflow control while standardizing tools and turning existing procedures into explicit instructions. This can make dynamic processes more adaptable than fully declarative orchestration alone.

Their practical value depends on disciplined deployment. Stronger models are recommended first to establish a quality baseline, followed by evaluation-driven substitution of smaller models to reduce cost and latency. That makes agent design an engineering and operations problem, not only a prompting problem.

Agents also matter because autonomy increases risk. Tool access, external actions, and workflow control require layered guardrails such as moderation, relevance and safety classifiers, PII filtering, tool safeguards, output validation, and human intervention. Their usefulness is therefore tied to how safely they can operate in production.

## Tensions And Debates
- The term “agent” is contested: some use it for many LLM applications, while the stricter definition requires workflow control plus tool use on the user’s behalf.
- There is a tradeoff between starting with the most capable model for accuracy and moving to smaller models for lower cost and latency.
- Single-agent systems are the recommended default, but growing prompt complexity and tool-selection errors can justify splitting work across multiple agents.
- Multi-agent orchestration can improve specialization, yet it adds coordination complexity compared with a well-designed single agent.
- Code-first orchestration may stay more flexible for dynamic workflows, while explicit graph-style branching can become cumbersome when every loop and branch must be predefined.
- Greater autonomy increases usefulness but also expands the need for safeguards, output checks, and human escalation.

## Open Questions
- What evaluation methods and metrics should be used to establish an agent performance baseline?
- How should teams decide when tool count or tool overlap is high enough to justify moving from one agent to several?
- What concrete criteria should determine whether a tool is low, medium, or high risk in production?
- How should organizations choose between API-based tools and computer-use approaches for legacy systems with weak integrations?
- What human-in-the-loop operating model works best during early deployment beyond escalation for repeated failures or high-risk actions?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/a-practical-guide-to-building-agents]]

## Related Concepts
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/single-agent-systems]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/concepts/manager-pattern]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/human-intervention]]
<!-- kb:concept-links:end -->
