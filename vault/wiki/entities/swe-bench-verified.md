---
kind: "entity"
title: "SWE-bench Verified"
entity: "SWE-bench Verified"
source_count: 1
tags:
  - "entity"
---
# SWE-bench Verified

## Who Or What It Is
SWE-bench Verified is referenced as the setting for Anthropic’s coding-agent work, where tool-interface choices materially affected reliability. The available evidence does not define it in detail, but it is associated with evaluating or running software-engineering tasks that involve filepaths, tools, and recurring error modes.

## Description
Anthropic cites SWE-bench Verified in a discussion of practical agent design rather than as a standalone concept. In that context, it serves as an example showing that agent performance can depend heavily on the design of tool interfaces, not just on model prompts.

The clearest reported detail is a specific failure mode: using relative filepaths caused recurring errors in Anthropic’s SWE-bench agent work. Changing those interfaces to use absolute filepaths removed that error mode. This makes SWE-bench Verified important as evidence that small interface decisions can significantly improve coding-agent reliability.

Its relevance is tied to coding agents more broadly. Anthropic highlights coding as a promising domain for agents because code execution and automated tests can provide strong environmental feedback. SWE-bench Verified appears connected to that class of tasks, though the exact benchmark design, scope, and verification criteria are not specified.

## Key Relationships
- **Anthropic** references SWE-bench Verified in support of its broader agent-design recommendations.
- **Coding agents** are the main context in which SWE-bench Verified appears.
- **Tool design** is directly linked to SWE-bench Verified through the filepath example.
- **Agent-computer interface (ACI)** concerns are illustrated by the switch from relative to absolute filepaths.
- **Environmental feedback** matters in the same broader coding-agent setting, where code execution and tests can ground agent behavior.
- **Building Effective AI Agents** uses SWE-bench Verified as concrete evidence that interface details can eliminate recurring failure modes.

## Open Questions
- What exactly is verified in SWE-bench Verified, and how is that verification performed?
- Is SWE-bench Verified a benchmark, dataset, task suite, or evaluation subset?
- What kinds of software-engineering tasks are included in SWE-bench Verified?
- Beyond filepath format, what other tool-interface choices most affect performance in this setting?
- How strongly do results from SWE-bench Verified generalize to production coding agents?

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
- [[wiki/entities/model-context-protocol]]
- [[wiki/entities/strands-agents-sdk-by-aws]]
- [[wiki/entities/rivet]]
- [[wiki/entities/vellum]]
- [[wiki/entities/claude-sonnet-45]]
<!-- kb:entity-links:end -->
