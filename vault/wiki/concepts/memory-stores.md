---
kind: "concept"
title: "Memory stores"
concept: "Memory stores"
source_count: 1
tags:
  - "concept"
---
# Memory stores

## Definition
Memory stores are persistent memory capabilities associated with Claude Managed Agents that let information carry across agent work beyond a single session, though the documented feature is only described at a high level and is in limited research preview.

## Description
Within Claude Managed Agents, memory stores appear as part of a broader agent system that also includes sessions, tools, environments, MCP integrations, outcomes, and multi-agent coordination. They are presented as a way to persist information rather than keeping all context confined to one isolated run.

The available description links memory to production-oriented agent workflows rather than one-off prompt exchanges. In that framing, an agent can be configured with tools, sandboxed execution, and explicit success criteria, while memory provides continuity that a single context window would not.

Memory stores are mentioned alongside parallel sessions, shared and isolated execution contexts, and coordinated specialist agents. That positioning suggests they may help agents retain useful state or prior knowledge across runs or collaborating components, but the exact structure and boundaries are not specified.

Availability is limited. Memory is explicitly described as part of a limited research preview, rather than a generally available capability.

## Why It Matters
Persistent memory matters because production agents often need continuity. Tasks like repository auditing, repeated web tracking, reporting, and operational follow-up can span multiple steps and sessions, making it useful for an agent system to retain information beyond a single interaction.

It also matters for agent architectures that are more than a lone model call. Claude Managed Agents is framed as a managed system with sessions, environments, graders, and specialist agents; memory fits that model by supporting longer-running and potentially coordinated workflows.

Memory stores are especially relevant where agents run in parallel or where work is evaluated and revised iteratively against explicit rubrics. Persistent state can support handoffs, retained findings, and continuity across repeated attempts, even though the documented material does not spell out the exact mechanism.

The feature’s preview status also matters operationally. Teams evaluating managed agents cannot assume memory is broadly available or fully specified, so adoption decisions depend on early-access access and tolerance for an evolving capability.

## Tensions And Debates
- Memory is positioned as a key capability, but it is also explicitly limited to research preview rather than broad availability.
- The concept implies persistence across sessions, yet the scope of that persistence is not defined.
- Memory is mentioned near both shared and isolated execution contexts, leaving open how retention interacts with session isolation.
- Multi-agent coordination and memory are presented together, but the division between shared agent state and per-agent memory is unclear.
- Production usefulness is implied, while governance, permissions, and lifecycle controls for stored memory are not described.

## Open Questions
- How are memory stores structured in practice?
- What is the scope of a memory store across sessions, agents, or organizations?
- How are memory stores governed, including permissions and review controls?
- How do memory stores interact with parallel sessions and isolated containers?
- What specific memory features are included in the limited research preview?
- How are memory stores used alongside outcomes, graders, and multi-agent orchestration?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/what-is-claude-managed-agents]]

## Related Concepts
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/sandbox-environments]]
- [[wiki/concepts/isolated-containers]]
- [[wiki/concepts/rubric-based-evaluation]]
- [[wiki/concepts/parallel-task-execution]]
- [[wiki/concepts/multi-agent-coordination]]
- [[wiki/concepts/event-streaming]]
<!-- kb:concept-links:end -->
