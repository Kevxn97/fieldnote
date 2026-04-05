---
kind: "concept"
title: "Agent-computer interface (ACI)"
concept: "Agent-computer interface (ACI)"
source_count: 1
tags:
  - "concept"
---
# Agent-computer interface (ACI)

## Definition
Agent-computer interface (ACI) is the tool and environment interface through which an LLM agent observes computer state, takes actions, and receives feedback, including tool definitions, action formats, file and resource references, and execution results.

## Description
In Anthropic’s usage, ACI is part of the practical design of agentic systems rather than a separate framework layer. It sits between an augmented LLM and the external systems it can use, such as retrieval, tools, memory, and executable environments. The quality of that interface shapes how reliably the model can choose and carry out actions.

ACI includes the structure of tool calls and the form of environmental feedback. Anthropic emphasizes that agents work better when each step produces grounded results from the environment, such as tool outputs or code execution results. This makes the interface a core part of the agent’s control loop, not just a transport mechanism for commands.

Tool design is treated as an ACI concern. Anthropic argues that tool definitions deserve as much optimization effort as prompts, especially in production systems and coding agents. Interfaces should be easy for models to generate and should minimize unnecessary formatting burden.

Small ACI choices can materially change performance. In Anthropic’s SWE-bench agent work, changing file references from relative paths to absolute filepaths removed a recurring error mode. That example suggests that ACI quality often depends on concrete affordances and constraints rather than abstract autonomy alone.

## Why It Matters
ACI strongly affects reliability. Anthropic ties effective agents to transparent planning, good tool interfaces, environmental feedback, stopping conditions, and human checkpoints. If the interface is ambiguous or awkward, the model is more likely to make avoidable errors even when the underlying model is capable.

It also affects whether agentic complexity is justified. Anthropic recommends starting with the simplest possible system and adding workflows or agents only when they clearly improve outcomes. A well-designed ACI can help simpler systems succeed, while a poor interface can make more autonomous systems expensive, slow, and hard to debug.

The importance is especially visible in domains with strong feedback loops. Customer support benefits when conversations connect cleanly to actions and measurable resolution. Coding agents benefit when the interface exposes executable tests and clear file operations, giving the model grounded signals about whether its actions worked.

ACI also influences developer ergonomics. Anthropic prefers direct LLM API usage over frameworks when possible because hidden abstractions can obscure prompts, responses, and tool behavior. Clear interfaces make debugging easier and make agent behavior more legible.

## Tensions And Debates
- How much autonomy to expose through the interface versus how much process to keep in predefined workflows.
- Whether general agent frameworks help standardize ACI or instead obscure prompts, responses, and tool behavior.
- Rich tool capability versus interface simplicity; more power can come with more formatting burden and more failure modes.
- Model-directed action selection versus human checkpoints and explicit stopping conditions.
- Standardized tool integration approaches such as Model Context Protocol versus custom integrations tuned to a specific environment.
- Flexible references and abstractions versus rigid, explicit formats such as absolute filepaths that reduce ambiguity.

## Open Questions
- Which concrete ACI designs most reliably improve outcomes enough to justify added latency and cost from agentic systems?
- What tool schemas and action formats are easiest for models to use accurately across different domains?
- When should teams prefer Model Context Protocol over custom tool integrations?
- Which forms of environmental feedback produce the strongest control loops for autonomous agents?
- What stopping conditions and human-review checkpoints work best for different classes of ACI-enabled tasks?
- Beyond customer support and coding, which domains benefit most from a carefully designed ACI?

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
- [[wiki/concepts/evaluator-optimizer]]
<!-- kb:concept-links:end -->
