---
kind: "entity"
title: "**OpenAI moderation API**"
entity: "**OpenAI moderation API**"
source_count: 1
tags:
  - "entity"
---
# OpenAI moderation API

## Who Or What It Is
The OpenAI moderation API is an OpenAI safety component referenced in the context of building AI agents. It appears as part of the guide’s layered-guardrails approach, where moderation is one of several protections used to keep agent behavior and outputs within acceptable bounds.

## Description
The guide places moderation within a broader safety system for agentic workflows. In that framing, moderation is not treated as a standalone solution, but as one layer alongside relevance classifiers, safety classifiers, PII filtering, tool safeguards, output validation, and human escalation.

Its role is tied to agents that manage workflow execution and use tools on a user’s behalf. Because such systems can retrieve context, make decisions, and trigger actions, the guide presents moderation as part of the control stack needed to reduce unsafe or inappropriate behavior during operation.

The material does not provide implementation details, specific categories, or exact API behaviors. It identifies the OpenAI moderation API by name, but leaves its precise inputs, outputs, and recommended placement within an agent loop unspecified.

## Key Relationships
- **OpenAI** — the moderation API is identified as an OpenAI entity in the guide.
- **Guardrails** — moderation is included as one element of a layered guardrail system.
- **AI agents** — moderation is discussed in the context of agents acting autonomously within defined limits.
- **Safety classifiers** — moderation is grouped with other safety-oriented controls rather than replacing them.
- **PII filtering** — the guide presents moderation alongside privacy-focused filtering measures.
- **Output validation** — moderation sits near downstream checks that validate agent responses or actions.
- **Human intervention** — moderation is part of a broader safety approach that still includes escalation for failures or high-risk actions.

## Open Questions
- At what points in an agent loop should the OpenAI moderation API be applied: on user input, retrieved context, model output, tool arguments, or all of these?
- How does the guide distinguish moderation from other listed controls such as safety classifiers or relevance classifiers?
- What kinds of policy violations or risk categories is the API expected to detect in agent workflows?
- When should moderation trigger automatic blocking versus human review?
- How should moderation interact with tool risk ratings and other rules-based safeguards in production systems?

<!-- kb:entity-links:start -->
## Evidence Links
- [[wiki/sources/a-practical-guide-to-building-agents]]

## Related Concepts
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/workflow-execution]]
- [[wiki/concepts/single-agent-systems]]
- [[wiki/concepts/multi-agent-systems]]
- [[wiki/concepts/manager-pattern]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/human-intervention]]

## Related Entities
- [[wiki/entities/openai]]
- [[wiki/entities/agents-sdk]]
- [[wiki/entities/o1]]
- [[wiki/entities/o3-mini]]
- [[wiki/entities/websearchtool]]
<!-- kb:entity-links:end -->
