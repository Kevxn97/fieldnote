---
kind: "source"
title: "What is Claude Managed Agents?"
source_id: "src_what-is-claude-managed-agents_ca6cace4"
source_kind: "text"
raw_path: "raw/clips/what-is-claude-managed-agents.md"
source_url: "https://www.youtube.com/watch?v=NLWiIj47IdI"
authors:
  - "[[Claude]]"
published: "2026-04-09"
created: "2026-04-10"
description: "Claude Managed Agents is a suite of APIs for building production-ready agents. You define the tools, environments, and success criteria. Claude works until the job is done.Outcomes, multi-agent orch"
source_tags:
  - "clippings"
related_assets:
tags:
  - "source"
  - "text"
---
# What is Claude Managed Agents?

## Summary
Claude Managed Agents is presented as a suite of APIs for building and deploying agents at scale. In the source, developers define agents by specifying tools, personas, capabilities, sandbox environments, and success criteria, while Claude executes the work inside isolated containers with filesystem access, bash execution, and web search.

The transcript emphasizes that these agents are meant for production-style workflows rather than one-off prompts. Example patterns include auditing and modifying a mounted GitHub repository, tracking SaaS pricing changes across the web, generating reports, posting outputs to Slack and Asana through MCP servers, and handling monitoring alerts through coordinated specialist agents.

A central theme is iterative completion against explicit rubrics. One example uses a separate grader in its own context window to evaluate whether a website optimization task meets criteria like Lighthouse score thresholds, lazy loading, and elimination of render-blocking resources; Claude then revises and resubmits until the rubric is satisfied.

The source also highlights parallel sessions, shared and isolated execution contexts, and persistent memory. However, it explicitly says that outcomes, multi-agent orchestration, and memory are available only as a limited research preview with an early access application.

## Key Points
- Claude Managed Agents is described as “a suite of APIs for building and deploying agents at scale.”
- Developers configure agents with specific tools, personas, capabilities, and sandbox environments, including packages and network controls.
- Sessions are launched from the developer’s own application, and Claude performs work inside an isolated container with full filesystem access, bash execution, and web search.
- In the website-performance example, a backend creates a session, mounts a GitHub repo, and points Claude at an environment with Lighthouse and Puppeteer pre-installed.
- The source describes rubric-driven completion criteria such as “Lighthouse score above 90,” “No render blocking resources,” and “All images lazy loaded.”
- Tool calls can stream back to the application in real time through an event stream, and a separate grader can evaluate outputs in its own context window.
- Multiple sessions can run in parallel as separate containers handling separate tasks.
- Memory, MCP integrations, outcomes, and multi-agent coordination are presented as key capabilities, but the description says outcomes, multi-agent orchestration, and memory are in limited research preview.

## Entities
- Claude Managed Agents
- Claude
- GitHub
- Lighthouse
- Puppeteer
- Slack
- Asana
- MCP servers

## Concepts
- Agent sessions
- Sandbox environments
- Isolated containers
- Rubric-based evaluation
- Parallel task execution
- Memory stores
- Multi-agent coordination
- Event streaming

## Contradictions And Updates
- The source updates availability expectations by stating that outcomes, multi-agent orchestration, and memory are only in a limited research preview, not broadly available.
- It refines the idea of an “agent” from a single model call to a managed system including sessions, environments, tools, MCP, memory, outcomes, and multi-agent coordination.
- It suggests completion is not just prompt-response generation: developers define what “done” looks like, and Claude iterates until those criteria are met.

## Open Questions
- What exact API surface and developer workflow are included in the “suite of APIs” beyond the examples shown in the transcript?
- What permissions, review, and policy controls are available beyond the single approval gate shown before posting to Slack?
- How are memory stores structured, scoped, and governed across sessions, agents, and organizations?
- What are the operational limits of the isolated containers, including runtime, package support, and network access controls?
- What specific features are included in the limited research preview for outcomes, multi-agent orchestration, and memory?

## Raw References
- raw/clips/what-is-claude-managed-agents.md

<!-- kb:source-links:start -->
## Knowledge Graph
- Source: [[wiki/sources/what-is-claude-managed-agents]]
- Raw: [[raw/clips/what-is-claude-managed-agents]]
- [[wiki/entities/claude-managed-agents]]
- [[wiki/entities/claude]]
- [[wiki/entities/github]]
- [[wiki/entities/lighthouse]]
- [[wiki/entities/puppeteer]]
- [[wiki/entities/slack]]
- [[wiki/entities/asana]]
- [[wiki/entities/mcp-servers]]
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/sandbox-environments]]
- [[wiki/concepts/isolated-containers]]
- [[wiki/concepts/rubric-based-evaluation]]
- [[wiki/concepts/parallel-task-execution]]
- [[wiki/concepts/memory-stores]]
- [[wiki/concepts/multi-agent-coordination]]
- [[wiki/concepts/event-streaming]]
<!-- kb:source-links:end -->
