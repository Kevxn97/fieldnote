---
kind: "concept"
title: "**Multi-agent systems**"
concept: "**Multi-agent systems**"
source_count: 1
tags:
  - "concept"
---
# Multi-agent systems

## Definition
Multi-agent systems are agent architectures in which multiple LLM-based agents coordinate to complete a workflow, typically by dividing responsibilities across specialized agents and connecting them through either a central manager or decentralized handoffs.

## Description
A multi-agent system extends a single-agent design when one agent is no longer sufficient to manage a workflow cleanly. In the documented guidance, the trigger is usually rising orchestration complexity: prompt logic becomes too complex, or overlapping tools cause repeated tool-selection mistakes.

Two main patterns are described. In a **manager pattern**, a central agent delegates work to specialized agents through tool calls. In a **decentralized handoff** pattern, peer agents transfer execution directly to one another instead of routing everything through a single controller.

These systems can include agents that are exposed as tools to other agents. That makes multi-agent orchestration part of the broader tool layer, alongside data tools, action tools, and other orchestration tools.

The recommended design sequence is conservative. Teams are advised to maximize what a single agent with good tools and instructions can do before splitting the workflow into multiple agents.

## Why It Matters
Multi-agent systems matter when a workflow contains enough branching, specialization, or coordination overhead that a single-agent setup becomes difficult to maintain or unreliable in practice. They provide a way to organize complex tasks without forcing all reasoning and tool use into one prompt.

They also matter because they offer structured alternatives for delegation. A manager architecture can centralize control, while decentralized handoffs can distribute control among peers. That gives teams more than one way to decompose complicated agent behavior.

In practice, the concept matters partly because multi-agent design is easy to overapply. The guidance explicitly warns against starting with a fully autonomous multi-agent architecture by default. Treating multi-agent orchestration as a later step helps avoid unnecessary complexity.

Safety and reliability also become more important as more agents are introduced. Since agents can call tools and act on a user’s behalf, multi-agent systems inherit the need for layered guardrails, tool safeguards, validation, and human intervention for failures or high-risk actions.

## Tensions And Debates
- Whether to introduce multiple agents early for modularity or delay them until a single-agent system clearly fails on complexity or tool-selection reliability.
- Whether a **manager pattern** or **decentralized handoffs** is the better coordination model for a given workflow.
- The tradeoff between specialization across several agents and the added orchestration complexity that comes with more components.
- Whether agents should be composed primarily through code-first orchestration or through more explicitly declared workflow graphs, especially for dynamic workflows.
- How much autonomy multi-agent systems should have before human escalation is required for risky actions or repeated failures.

## Open Questions
- What concrete threshold of prompt complexity justifies splitting one agent into several specialized agents?
- How much tool overlap or tool-selection error is enough to warrant moving from a single-agent to a multi-agent design?
- Under what conditions is a manager architecture preferable to decentralized peer handoffs?
- How should evaluation be structured to compare single-agent and multi-agent performance, cost, and latency?
- What operating model for human intervention works best once several agents can delegate, hand off, and take actions through tools?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/a-practical-guide-to-building-agents]]

## Related Concepts
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/single-agent-systems]]
- [[wiki/concepts/manager-pattern]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/human-intervention]]
<!-- kb:concept-links:end -->
