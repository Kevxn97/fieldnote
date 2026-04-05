---
kind: "concept"
title: "**Guardrails**"
concept: "**Guardrails**"
source_count: 1
tags:
  - "concept"
---
# Guardrails

## Definition
Guardrails are the explicit safety and control mechanisms that bound how an AI agent operates, including layered checks such as relevance and safety classifiers, PII filtering, moderation, tool safeguards, output validation, rules-based protections, tool risk ratings, and human escalation for failures or high-risk actions.

## Description
Guardrails define the operational limits within which an agent can act on a user’s behalf. In the documented agent model, an application is not acting as an agent merely because it uses an LLM; it also needs to manage workflow execution, use tools, and do so within explicit guardrails.

They are described as a layered system rather than a single filter. The layers can include relevance classifiers to determine whether a request fits the intended scope, safety classifiers and moderation to catch unsafe content, and PII filtering to reduce exposure of sensitive data.

Guardrails also apply to tools and actions, not just model outputs. Tool safeguards, tool risk ratings, and rules-based protections help constrain what an agent is allowed to do, especially when tools can trigger external actions or access important systems.

The final layer is operational rather than purely technical: human intervention. Repeated failures and high-risk actions are cases where the agent should escalate instead of continuing autonomously.

## Why It Matters
Guardrails are part of what makes an agent usable in production. Since agents are intended to manage workflows and take actions with some independence, they need controls that keep that autonomy within acceptable boundaries.

They matter especially in the kinds of workflows where agents are most useful: tasks involving nuanced judgment, unstructured data, and hard-to-maintain deterministic rules. In those settings, purely fixed automation breaks down, but unconstrained autonomy creates operational and safety risk.

Layered guardrails also support incremental deployment. The documented approach favors starting with a strong single agent, evaluating performance, and then adding complexity only as needed. Safety layers, validation, and human escalation make that gradual rollout more practical.

They also protect tool use, which is central to agent behavior. Because tools let agents gather context and take actions, controls on tool access and action risk are as important as controls on generated text.

## Tensions And Debates
- Guardrails must limit harmful or out-of-scope behavior without preventing the agent from being useful and autonomous in complex workflows.
- It remains unresolved how much safety should come from explicit rules and validation versus model instructions and general model capability.
- Tool control introduces a tradeoff between operational flexibility and action safety, especially when tools vary in risk.
- Human escalation improves safety, but it can reduce the autonomy and efficiency that make agents attractive.
- As systems move from a single agent to multi-agent orchestration, guardrails may need to cover handoffs and delegation as well as individual outputs and tool calls.

## Open Questions
- What concrete criteria should determine whether a tool is rated low, medium, or high risk in production?
- What evaluation methods and metrics should teams use to measure whether guardrails are effective?
- When should an agent escalate to a human beyond the general cases of high-risk actions and repeated failures?
- How should organizations set thresholds for relevance, safety, and PII filtering without causing excessive false positives or missed issues?
- How should guardrail design change when agents are exposed as tools to other agents or participate in multi-agent handoffs?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/a-practical-guide-to-building-agents]]

## Related Concepts
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/single-agent-systems]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/concepts/manager-pattern]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/human-intervention]]
<!-- kb:concept-links:end -->
