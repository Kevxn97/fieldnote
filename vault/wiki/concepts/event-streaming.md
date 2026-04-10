---
kind: "concept"
title: "Event streaming"
concept: "Event streaming"
source_count: 1
tags:
  - "concept"
---
# Event streaming

## Definition
Event streaming is the real-time delivery of agent activity back to the application, especially tool calls emitted while a managed agent session is running inside an isolated container.

## Description
In Claude Managed Agents, sessions are launched from a developer’s application, and Claude performs work in a sandboxed environment with filesystem access, bash execution, web search, and configured tools. Event streaming is the mechanism described for sending tool-call activity back to that application as the work happens.

The documented usage is operational rather than conversational. A developer can mount a repository, provide an environment with packages such as Lighthouse and Puppeteer, and define success criteria. As Claude audits, edits, evaluates, and retries, the application can receive streamed events instead of waiting only for a final result.

Event streaming appears alongside other session features such as parallel execution, separate containers for separate tasks, and grader-based evaluation in a different context window. In that setting, the stream gives visibility into ongoing work across long-running, production-style workflows.

The term is somewhat narrow in the available material. The explicit example is streaming tool calls in real time; broader event types, schemas, or guarantees are not described.

## Why It Matters
Real-time event delivery matters because these agents are designed for multi-step jobs, not single prompt-response interactions. When work unfolds across file edits, bash commands, web lookups, and external integrations, streamed events let an application observe progress while the task is still in flight.

It also supports operational control. The material shows agents posting outputs to systems such as Slack and Asana through MCP servers, and includes an approval gate before at least one external action. Streaming intermediate events can make those handoffs more reviewable and easier to coordinate.

For iterative workflows, visibility is especially important. The examples describe rubric-driven completion, where Claude revises and resubmits until a grader judges the task complete. Event streaming can expose those repeated tool uses and retries as the agent works toward explicit success criteria.

It also fits parallel execution. When multiple sessions run in separate containers on separate tasks, a real-time stream gives the calling application a way to track each session without collapsing everything into a single final response.

## Tensions And Debates
- The material clearly supports real-time streaming of tool calls, but does not establish whether event streaming includes broader state changes, grader outputs, or only tool activity.
- More visibility improves observability, but the documented workflows also involve isolated containers, mounted repositories, and external systems, which raises unanswered boundaries around what should be exposed in the stream.
- Streaming favors responsiveness during long-running tasks, but the available description does not clarify delivery guarantees, ordering, or failure behavior for production use.
- Event streaming helps with approval and oversight, yet the examples only show a limited approval pattern, leaving the control model around streamed actions underspecified.

## Open Questions
- Which event types are available beyond tool calls, if any?
- How are streamed events structured, ordered, and identified across parallel sessions?
- Can grader decisions and rubric evaluations be streamed in the same way as tool activity?
- What review, permission, or approval controls can be applied to streamed actions before they affect external systems?
- How does event streaming behave for long-running sessions, retries, and container failures?

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
- [[wiki/concepts/multi-agent-coordination]]
<!-- kb:concept-links:end -->
