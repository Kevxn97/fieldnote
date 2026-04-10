---
kind: "output"
question: "explain multi-agent-systems"
format: "answer"
created_at: "2026-04-05T20:57:09.500Z"
sources:
  - "wiki/concepts/multi-agent-systems.md"
  - "wiki/system/catalog.md"
  - "wiki/concepts/single-agent-systems.md"
  - "wiki/sources/a-practical-guide-to-building-agents.md"
  - "wiki/entities/agents-sdk.md"
  - "wiki/sources/building-effective-ai-agents.md"
  - "wiki/entities/claude-agent-sdk.md"
  - "wiki/concepts/agentic-systems.md"
  - "wiki/concepts/decentralized-handoffs.md"
  - "wiki/concepts/ai-agents.md"
tags:
  - "output"
  - "answer"
---
# Multi-Agent Systems

## Answer
Multi-agent systems are agent architectures where multiple LLM-based agents coordinate to complete a workflow. In this wiki, the core idea is that the work is split across specialized agents, and those agents are connected either through a central manager or through decentralized handoffs. They are not the default starting point: the guidance says to first maximize what a single agent can do, and only split into multiple agents when orchestration becomes too complex or tool-selection errors start piling up.

A practical way to think about it:
1. **Single agent first** — one agent manages the workflow.
2. **Split by responsibility** — add specialized agents when the task becomes hard to keep clean in one loop.
3. **Choose a coordination model** — either a **manager pattern** or **decentralized handoffs**.
4. **Keep guardrails and human escalation in view** — more agents means more need for safety, validation, and intervention.

**Inference:** Multi-agent systems are mainly a workflow-organization strategy, not just “more agents for better quality.”

## Evidence
- “Multi-agent systems are agent architectures in which multiple LLM-based agents coordinate to complete a workflow, typically by dividing responsibilities across specialized agents and connecting them through either a central manager or decentralized handoffs.” [[wiki/concepts/multi-agent-systems.md]]
- The page says multi-agent systems are usually introduced when orchestration complexity rises, such as when prompt logic becomes too complex or overlapping tools cause repeated tool-selection mistakes. [[wiki/concepts/multi-agent-systems.md]]
- It describes two main coordination patterns: a **manager pattern** with a central delegating agent, and a **decentralized handoff** pattern where peer agents transfer execution directly. [[wiki/concepts/multi-agent-systems.md]]
- It also notes that agents can be exposed as tools to other agents, making multi-agent orchestration part of the broader tool layer. [[wiki/concepts/multi-agent-systems.md]]
- The recommended sequence is conservative: maximize what a single agent can do before splitting the workflow into multiple agents. [[wiki/concepts/multi-agent-systems.md]]
- The single-agent page frames the baseline as one LLM-driven agent managing workflow execution with tools and guardrails, which is the contrast point for multi-agent designs. [[wiki/concepts/single-agent-systems.md]]

## Gaps
- The retrieved material does not give concrete implementation examples of a multi-agent system.
- It does not specify a numeric threshold for when a single agent should be split into multiple agents.
- It does not compare performance, cost, or latency between the manager and decentralized handoff patterns.
- It does not provide a worked example of agent-to-agent tool exposure.

## Suggested Next Questions
- What is a concrete example of a manager-pattern multi-agent workflow?
- What is a concrete example of decentralized handoffs between peer agents?
- When does tool overlap become serious enough to justify splitting one agent into several?
- How do multi-agent systems compare with single-agent systems on reliability and cost?
- What guardrails are recommended when several agents can delegate and act through tools?
