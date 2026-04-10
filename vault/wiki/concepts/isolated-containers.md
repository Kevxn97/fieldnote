---
kind: "concept"
title: "Isolated containers"
concept: "Isolated containers"
source_count: 1
tags:
  - "concept"
---
# Isolated containers

## Definition
Isolated containers are sandboxed execution environments used by Claude Managed Agents to run agent sessions with filesystem access, bash execution, web search, and developer-defined tooling, packages, and network controls.

## Description
In the documented agent workflow, work is executed inside a container rather than as a single prompt-response exchange. Developers define the environment around the agent, including tools, capabilities, sandbox settings, and success criteria, and Claude carries out the task within that bounded runtime.

These containers can include mounted project assets such as a GitHub repository and preinstalled packages needed for the job. One example describes an environment configured with Lighthouse and Puppeteer so the agent can inspect a site, modify code, and evaluate performance changes against an explicit rubric.

Isolation is also tied to session structure. Multiple sessions can run in parallel as separate containers handling separate tasks, and the material distinguishes between shared and isolated execution contexts. This places the container at the center of how task scope, runtime tools, and execution separation are organized.

The environment is not limited to static file handling. The container supports active operations such as shell commands and web search, and its tool activity can stream back to the calling application in real time through an event stream.

## Why It Matters
Isolated containers make agent work operational rather than purely conversational. They allow the agent to inspect files, run commands, use installed software, and act on repositories and web content in ways that fit production-style workflows like audits, modifications, reporting, and monitoring response.

They also support clearer control over what the agent can access. The documented setup has developers specifying sandbox environments, packages, and network controls, which makes the execution environment part of the application design rather than an implicit model capability.

Separation into distinct containers matters for concurrency and task management. When multiple sessions run in parallel as separate containers, different jobs can proceed independently without being collapsed into a single shared runtime.

This container model also supports iterative completion against explicit criteria. In the website optimization example, the agent works within the configured environment, is evaluated against a rubric, and revises until the defined thresholds are met, which depends on being able to repeatedly execute tooling inside the sandbox.

## Tensions And Debates
- The environment is described as isolated, but the same material also mentions mounted repositories, web search, MCP integrations, and configurable network access, creating a practical tradeoff between isolation and useful external connectivity.
- Separate containers enable parallel sessions, while the mention of shared and isolated execution contexts suggests unresolved design choices about when work should be strictly separated versus allowed to coordinate.
- Rich runtime access such as full filesystem access and bash execution expands agent capability, but also raises questions about permission boundaries and review controls beyond the single approval gate shown before posting to Slack.
- Developers are expected to define packages and sandbox settings, which increases precision and control, but also shifts operational complexity onto application builders.
- The runtime is central to production workflows, yet outcomes, multi-agent orchestration, and memory are described as limited research preview features, leaving unclear how container isolation interacts with broader cross-session coordination.

## Open Questions
- What are the runtime limits of these containers, including duration, resource ceilings, and package support?
- How granular are the network controls, and how are they enforced across different tools and external services?
- How are mounted repositories and filesystem changes scoped, persisted, or discarded across sessions?
- What are the exact differences between shared and isolated execution contexts in practice?
- How do approval, policy, and auditing controls apply to actions initiated from inside the container?
- How do isolated containers interact with preview features such as memory, outcomes, and multi-agent orchestration?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/what-is-claude-managed-agents]]

## Related Concepts
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/sandbox-environments]]
- [[wiki/concepts/rubric-based-evaluation]]
- [[wiki/concepts/parallel-task-execution]]
- [[wiki/concepts/memory-stores]]
- [[wiki/concepts/multi-agent-coordination]]
- [[wiki/concepts/event-streaming]]
<!-- kb:concept-links:end -->
