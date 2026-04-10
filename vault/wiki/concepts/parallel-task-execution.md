---
kind: "concept"
title: "Parallel task execution"
concept: "Parallel task execution"
source_count: 1
tags:
  - "concept"
---
# Parallel task execution

## Definition
Parallel task execution is the ability to run multiple agent sessions at the same time, with each session operating in its own isolated container on a separate task rather than serializing all work through a single prompt-response loop.

## Description
In the documented agent model, work happens through sessions launched from an application. Parallel task execution means those sessions do not have to wait on one another: multiple sessions can be started concurrently, each with its own environment, tools, and task scope.

The execution model is container-based. Each session runs inside an isolated container with filesystem access, bash execution, and web search, so concurrent work is framed as separate execution contexts rather than multiple threads inside one shared prompt. The material also notes both shared and isolated execution contexts, though the concrete example given for parallelism is separate containers handling separate tasks.

This shows up in production-style workflows where an application needs several pieces of work to proceed at once, such as auditing a repository, gathering information from the web, generating outputs, or responding to operational events. Tool calls can stream back in real time through an event stream while those sessions are running.

Parallel task execution is adjacent to multi-agent coordination, but they are not presented as identical. Running multiple sessions in parallel is described directly, while outcomes, multi-agent orchestration, and memory are stated to be in limited research preview.

## Why It Matters
Parallel execution shifts agents from a one-off prompt interface toward operational systems that can handle several jobs at once. That matters for deployment at scale, where separate tasks may need their own tools, environments, and success criteria without blocking each other.

Isolation matters alongside concurrency. By placing each concurrent task in its own container, the system can mount different repositories, use different packages, and run task-specific commands without collapsing everything into one shared working state.

It also supports specialized workflow design. The material describes coordinated specialist agents for monitoring alerts and separate grading contexts for evaluating whether outputs meet an explicit rubric. Even where fuller orchestration is preview-only, the documented pattern already treats concurrent work as part of how production agents complete jobs.

In practice, this can reduce latency for multi-step operations and make external integrations more usable. If sessions can run simultaneously and stream events back to the application, downstream systems such as Slack, Asana, or other MCP-connected tools can receive results from ongoing work instead of waiting for a single monolithic run to finish.

## Tensions And Debates
- Parallel sessions are described directly, but broader multi-agent orchestration is only in limited research preview, leaving a boundary between simple concurrency and managed coordination.
- The material mentions both shared and isolated execution contexts, but the operational tradeoff between those models is not specified.
- Running tasks in separate containers improves isolation, but it may complicate workflows that need shared state or persistent memory; memory itself is also preview-only.
- Real-time event streaming helps observe concurrent work, but the approval and control model for actions across multiple active sessions is only lightly illustrated.
- Rubric-driven completion is clear for a single task example, while how success criteria are aggregated or reconciled across parallel tasks remains unspecified.

## Open Questions
- How are parallel sessions scheduled, limited, or prioritized when many tasks are launched at once?
- What state, if any, can be shared safely across concurrent sessions without relying on preview memory features?
- How do developers coordinate dependencies between parallel tasks when one task’s output should affect another’s execution?
- What monitoring and failure-handling mechanisms exist when one parallel session succeeds and another fails?
- How do approval gates work when several concurrent sessions attempt external actions such as posting to integrated systems?
- To what extent do preview features for outcomes and multi-agent orchestration change the practical meaning of parallel task execution?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/what-is-claude-managed-agents]]

## Related Concepts
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/sandbox-environments]]
- [[wiki/concepts/isolated-containers]]
- [[wiki/concepts/rubric-based-evaluation]]
- [[wiki/concepts/memory-stores]]
- [[wiki/concepts/multi-agent-coordination]]
- [[wiki/concepts/event-streaming]]
<!-- kb:concept-links:end -->
