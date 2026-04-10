---
kind: "concept"
title: "Multi-agent coordination"
concept: "Multi-agent coordination"
source_count: 1
tags:
  - "concept"
---
# Multi-agent coordination

## Definition
Multi-agent coordination is the orchestration of multiple agent sessions or specialist agents to work on related tasks in parallel or in sequence, with defined tools, environments, and success criteria. In the documented material, it is described as part of a managed-agent system and is associated with parallel execution, shared or isolated contexts, and, in some cases, memory and outcome management.

## Description
Multi-agent coordination extends the idea of an agent beyond a single prompt-response exchange. Instead of one agent handling an entire workflow alone, multiple agents can be launched as separate sessions, each operating in its own isolated container and taking responsibility for a distinct part of the work.

The documented examples frame this as coordination among specialist agents. One cited pattern is handling monitoring alerts through coordinated specialists, rather than routing every step through a single general-purpose agent. Another related pattern is running multiple sessions in parallel as separate containers for separate tasks.

Coordination sits alongside other managed-agent features such as sandbox environments, tool access, web search, filesystem operations, and rubric-based completion. Work can be evaluated against explicit criteria, and a separate grader can assess outputs in its own context window while the agent revises until requirements are met.

The capability is described together with outcomes and memory, suggesting a broader orchestration layer rather than only concurrent execution. However, multi-agent orchestration is not described as broadly available; it is explicitly identified as part of a limited research preview.

## Why It Matters
Multi-agent coordination matters when a workflow is too large, varied, or time-sensitive for a single agent session. Parallel sessions allow separate tasks to proceed at once, which supports production-style work such as repository changes, web monitoring, reporting, and alert handling.

It also supports specialization. Coordinated agents can be configured with different tools, personas, capabilities, or environments, which makes it possible to assign work according to function instead of forcing one agent to perform every role. The monitoring-alert example suggests this is valuable for operational workflows that benefit from specialist handling.

Coordination also matters for controllability. In the broader managed-agent model, developers define success criteria and can use separate evaluators or approval gates. Coordinating multiple agents within that structure creates a path toward more complex automation while still anchoring completion to explicit rubrics and developer-defined boundaries.

At the same time, its practical importance is constrained by availability. The material presents multi-agent orchestration as a key capability, but also states that it is in limited research preview, which makes it strategically significant but operationally not yet fully general.

## Tensions And Debates
- Multi-agent coordination is presented as a major capability, but its availability is limited to a research preview rather than general release.
- Parallel execution increases capability, but it also raises questions about when agents should share context versus remain isolated in separate containers.
- Specialist-agent coordination can improve task fit, but it introduces orchestration complexity compared with a single-agent workflow.
- The material links coordination with memory and outcomes, yet the exact relationship among these features is not fully specified.
- Production automation benefits from explicit success criteria and grading, but it is unclear how those controls scale across multiple coordinated agents.

## Open Questions
- What specific orchestration features are included in the limited research preview for multi-agent coordination?
- How are tasks divided among coordinated agents, and what determines whether work is parallel, sequential, shared, or isolated?
- How do memory stores operate across multiple agents or sessions, and what scope or persistence rules apply?
- What approval, oversight, and policy controls exist when multiple coordinated agents act across tools like Slack, Asana, or mounted repositories?
- How are outcomes represented and managed when several agents contribute to a single workflow?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/what-is-claude-managed-agents]]

## Related Concepts
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/sandbox-environments]]
- [[wiki/concepts/isolated-containers]]
- [[wiki/concepts/rubric-based-evaluation]]
- [[wiki/concepts/parallel-task-execution]]
- [[wiki/concepts/memory-stores]]
- [[wiki/concepts/event-streaming]]
<!-- kb:concept-links:end -->
