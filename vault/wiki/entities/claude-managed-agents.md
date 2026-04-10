---
kind: "entity"
title: "Claude Managed Agents"
entity: "Claude Managed Agents"
source_count: 1
tags:
  - "entity"
---
# Claude Managed Agents

## Who Or What It Is
Claude Managed Agents is a suite of APIs for building and deploying production-ready agents at scale. Developers define an agent’s tools, personas, capabilities, sandbox environment, and success criteria, and Claude carries out the work inside isolated execution contexts until the task meets the specified definition of done.

## Description
Claude Managed Agents is described as an agent system oriented toward ongoing workflows rather than single prompt-response interactions. Sessions are launched from a developer’s application, and Claude operates within isolated containers that can include full filesystem access, bash execution, web search, mounted repositories, installed packages, and controlled network access.

A core pattern is rubric-driven completion. Developers specify explicit criteria for success, and Claude iterates on the task until those criteria are satisfied. One example involves website optimization against requirements such as achieving a Lighthouse score above 90, removing render-blocking resources, and ensuring images are lazy loaded. A separate grader can evaluate outputs in its own context window, allowing revision and resubmission loops.

The system is presented as supporting production workflows such as auditing and editing a GitHub repository, monitoring SaaS pricing changes across the web, generating reports, posting results to Slack and Asana through MCP servers, and responding to monitoring alerts through coordinated specialist agents. Tool calls can stream back to the application in real time through an event stream, and multiple sessions can run in parallel as separate containers.

Several advanced capabilities are highlighted but not fully available. Memory, outcomes, and multi-agent orchestration are described as part of the model for managed agents, yet the source explicitly says that outcomes, multi-agent orchestration, and memory are only in a limited research preview with early access.

## Key Relationships
- **Claude** — executes the defined work inside managed sessions and isolated containers.
- **Agent sessions** — the operational unit launched from a developer’s application for task execution.
- **Sandbox environments** — define packages, tools, and network controls available to the agent.
- **Rubric-based evaluation** — developers specify success criteria, and Claude iterates until the rubric is met.
- **Lighthouse and Puppeteer** — cited as pre-installed tools in a website-performance workflow example.
- **GitHub repositories** — can be mounted into the execution environment for auditing and modification tasks.
- **Slack, Asana, and MCP servers** — examples of downstream integrations for posting outputs or connecting external systems.
- **Memory, outcomes, and multi-agent orchestration** — positioned as important capabilities, but stated to be in limited research preview.

## Open Questions
- What exact API surface is included in the “suite of APIs” beyond the examples described?
- What permissioning, review, and policy controls exist beyond the single approval step shown before posting to Slack?
- How are memory stores structured, scoped, and governed across sessions, agents, and organizations?
- What are the operational limits of the isolated containers, including runtime, package support, and network restrictions?
- What specific functionality is included in the limited research preview for outcomes, multi-agent orchestration, and memory?

<!-- kb:entity-links:start -->
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
- [[wiki/concepts/event-streaming]]

## Related Entities
- [[wiki/entities/claude]]
- [[wiki/entities/github]]
- [[wiki/entities/lighthouse]]
- [[wiki/entities/puppeteer]]
- [[wiki/entities/slack]]
- [[wiki/entities/asana]]
- [[wiki/entities/mcp-servers]]
<!-- kb:entity-links:end -->
