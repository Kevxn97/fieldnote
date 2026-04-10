---
kind: "concept"
title: "Sandbox environments"
concept: "Sandbox environments"
source_count: 1
tags:
  - "concept"
---
# Sandbox environments

## Definition
Sandbox environments are the isolated execution setups used by managed agents, defined by developers to include specific tools, packages, and network controls, and realized as containers where Claude can work with filesystem access, bash execution, and web search.

## Description
The term covers both a configuration layer and a runtime layer. On the configuration side, developers specify the environment an agent should use, including capabilities, installed packages, and network constraints. On the runtime side, Claude executes the task inside an isolated container that matches that setup.

These environments are designed for agent sessions that do real work rather than only return a single response. A session can operate on mounted assets such as a GitHub repository, inspect and modify files, run shell commands, and use web search as part of a longer workflow.

Sandbox environments can also be specialized for a task. One documented example points Claude at an environment with Lighthouse and Puppeteer pre-installed so it can evaluate and improve website performance against explicit criteria. This makes the environment part of the task design, not just a neutral runtime.

Sessions can run in parallel as separate containers handling separate tasks. The broader system also mentions shared and isolated execution contexts, indicating that environment boundaries are part of how agent work is segmented and coordinated.

## Why It Matters
Sandbox environments make agent behavior more operationally concrete. Instead of relying on a model to reason abstractly about a task, the agent can inspect files, run commands, use installed tooling, and interact with the web inside a controlled setup.

They also support production-style workflows. Tasks such as auditing a repository, modifying code, generating reports, or tracking pricing changes depend on having the right tools and execution context available, and the environment is where those capabilities are assembled.

Isolation matters for parallelism and task separation. Running separate sessions in separate containers allows multiple jobs to proceed at once without collapsing into a single shared workspace.

The environment is also tied to success criteria. In the website-optimization example, the agent is evaluated against a rubric including Lighthouse score targets and asset-loading requirements, so the environment is part of how the agent can iteratively work until the defined outcome is met.

## Tensions And Debates
- “Sandbox environment” can refer either to the developer-defined setup or to the isolated container that executes the work, and the boundary between those meanings is not fully separated.
- The environment is described as isolated, but it also includes powerful capabilities such as filesystem access, bash execution, mounted repositories, and web search, creating a practical tradeoff between containment and usefulness.
- Developers can define packages and network controls, but the documented material does not spell out how restrictive or fine-grained those controls are.
- Separate containers support parallel work, while the broader system also mentions shared and isolated execution contexts, leaving some uncertainty about when isolation versus shared context is preferred.

## Open Questions
- What are the runtime limits of these environments, including execution duration and package support?
- How exactly are network access controls configured and enforced?
- What review or permission controls exist for actions taken from within a sandbox environment?
- How are mounted resources such as GitHub repositories exposed to the container and scoped across sessions?
- How do shared execution contexts relate to isolated sandbox containers in multi-step or multi-agent workflows?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/what-is-claude-managed-agents]]

## Related Concepts
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/isolated-containers]]
- [[wiki/concepts/rubric-based-evaluation]]
- [[wiki/concepts/parallel-task-execution]]
- [[wiki/concepts/memory-stores]]
- [[wiki/concepts/multi-agent-coordination]]
- [[wiki/concepts/event-streaming]]
<!-- kb:concept-links:end -->
