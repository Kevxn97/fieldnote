---
kind: "entity"
title: "Model Context Protocol"
entity: "Model Context Protocol"
source_count: 1
tags:
  - "entity"
---
# Model Context Protocol

## Who Or What It Is
Model Context Protocol is a protocol mentioned by Anthropic as one way for an augmented LLM to integrate third-party tools.

## Description
Anthropic places Model Context Protocol in the tooling layer around an augmented LLM. In that framing, the core model can be extended with capabilities such as retrieval, tools, and memory, and Model Context Protocol is one option for connecting external tools into that setup.

Its role is described narrowly but practically: it supports tool integration rather than replacing broader system design. Anthropic’s guidance emphasizes that reliable agentic systems depend on clear tool interfaces, evaluation, environmental feedback, and careful orchestration, so Model Context Protocol appears as an enabling integration mechanism within that larger design approach.

The protocol is referenced in a context that favors simple, composable systems over heavy abstractions. Anthropic recommends starting with direct LLM API usage and only adding complexity when it clearly improves outcomes, which suggests Model Context Protocol is relevant when third-party tool connectivity is needed, not as a justification for unnecessary framework complexity.

Specific implementation details, capabilities, and tradeoffs are not described beyond its use for third-party tool integration.

## Key Relationships
- **Anthropic** cites Model Context Protocol in its discussion of practical AI agent system design.
- **Augmented LLM** is the architecture context in which Model Context Protocol is mentioned.
- **Third-party tools** are the external systems Model Context Protocol is said to help integrate.
- **Agentic systems** may rely on tool access, making Model Context Protocol relevant to some workflow and agent designs.
- **Direct LLM API usage** is Anthropic’s recommended starting point, implying Model Context Protocol should be introduced selectively rather than by default.
- **Tool design** remains critical even when a protocol is used for integration; Anthropic stresses that tool interfaces deserve prompt-engineering-level attention.

## Open Questions
- What concrete capabilities does Model Context Protocol provide beyond basic third-party tool connectivity?
- When is Model Context Protocol preferable to custom tool integrations?
- What latency, reliability, or debugging tradeoffs arise when using Model Context Protocol?
- How well does Model Context Protocol support retrieval, memory, and other augmented-LLM capabilities beyond tool calls?
- What operational patterns has Anthropic found most effective when Model Context Protocol is part of an agent system?

<!-- kb:entity-links:start -->
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
- [[wiki/concepts/agent-computer-interface-aci]]

## Related Entities
- [[wiki/entities/anthropic]]
- [[wiki/entities/claude-agent-sdk]]
- [[wiki/entities/strands-agents-sdk-by-aws]]
- [[wiki/entities/rivet]]
- [[wiki/entities/vellum]]
- [[wiki/entities/swe-bench-verified]]
- [[wiki/entities/claude-sonnet-45]]
<!-- kb:entity-links:end -->
