---
kind: "concept"
title: "Agent sessions"
concept: "Agent sessions"
source_count: 1
tags:
  - "concept"
---
# Agent sessions

## Definition
Agent sessions are the managed execution units used by Claude Managed Agents: a developer-created runtime in which Claude operates inside an isolated container with defined tools, environment access, and success criteria, and continues working until the task is completed or evaluated against a rubric.

## Description
A session begins from the developer’s own application or backend. In the documented examples, the developer creates the session, specifies the available tools and environment, and can mount resources such as a GitHub repository. Claude then performs work inside that session rather than responding as a single prompt completion.

The session environment can include filesystem access, bash execution, web search, installed packages, and network controls. One example points Claude at a sandbox with Lighthouse and Puppeteer preinstalled so it can inspect and modify a website codebase and test the results directly.

Sessions are also used as context boundaries. A separate grader can run in its own context window to assess whether a task meets explicit criteria, and Claude can revise and resubmit based on that evaluation. In this sense, sessions support iterative task completion rather than one-pass generation.

The term also covers concurrent execution patterns. Multiple sessions can run in parallel as separate containers handling separate tasks, and the material also mentions shared and isolated execution contexts. Persistent memory is associated with these workflows, but memory is described as part of a limited research preview.

## Why It Matters
Agent sessions make the agent model operational for production-style work. Instead of relying on a single response, teams can give Claude a bounded runtime with tools, files, and concrete completion criteria, allowing it to perform actions such as auditing code, tracking web changes, generating reports, and coordinating downstream outputs.

They also provide a practical isolation layer. Running each task in its own container helps separate workstreams, makes parallel execution possible, and gives developers a clearer place to define permissions, packages, and environmental constraints.

Sessions matter for quality control because they support rubric-driven workflows. The website-performance example shows Claude working toward measurable targets such as Lighthouse score thresholds and elimination of render-blocking resources, with a separate grader evaluating whether the work is actually done.

They also matter for observability and orchestration. Tool calls can stream back through an event stream in real time, and multiple sessions can be used to divide labor across specialist tasks. That creates a path from prompting toward monitored, multi-step execution, even though some orchestration-related capabilities are still in preview.

## Tensions And Debates
- It is clear that sessions are central to managed agent execution, but related features such as outcomes, multi-agent orchestration, and memory are only described as limited research preview.
- Sessions are described as isolated containers, while the material also mentions shared and isolated execution contexts, leaving the exact boundary between isolation and coordination unresolved.
- The examples imply strong runtime capabilities, including filesystem access and bash execution, but the operational limits and permission model are not specified in detail.
- A session can represent a primary worker or a separate grader in its own context window, which raises an edge around whether all task roles are modeled uniformly as sessions.
- Real-world approval and governance controls appear only lightly in the examples, despite sessions being positioned for production workflows.

## Open Questions
- What exact API operations define the lifecycle of an agent session beyond creation and event streaming?
- How are session-level permissions, network controls, and package availability configured and enforced in practice?
- How are shared versus isolated execution contexts represented when multiple sessions collaborate?
- How are memory stores scoped across sessions, agents, and organizations when memory is enabled?
- What runtime limits apply to a session, including duration, resource usage, and external access?
- How much of multi-agent coordination is implemented through multiple sessions versus separate higher-level constructs?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/what-is-claude-managed-agents]]

## Related Concepts
- [[wiki/concepts/sandbox-environments]]
- [[wiki/concepts/isolated-containers]]
- [[wiki/concepts/rubric-based-evaluation]]
- [[wiki/concepts/parallel-task-execution]]
- [[wiki/concepts/memory-stores]]
- [[wiki/concepts/multi-agent-coordination]]
- [[wiki/concepts/event-streaming]]
<!-- kb:concept-links:end -->
