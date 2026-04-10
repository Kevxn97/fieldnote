---
kind: "entity"
title: "Puppeteer"
entity: "Puppeteer"
source_count: 1
tags:
  - "entity"
---
# Puppeteer

## Who Or What It Is
Puppeteer is a tool described as being pre-installed in a Claude Managed Agents sandbox environment used for a website-performance task. In the available evidence, it appears as part of the execution environment alongside Lighthouse rather than as a separately explained product or service.

## Description
In the described workflow, a backend creates an agent session, mounts a GitHub repository, and points Claude at an environment with Lighthouse and Puppeteer pre-installed. This places Puppeteer in the category of environment-level tooling that agents can use while working inside isolated containers.

Puppeteer is mentioned specifically in the context of website optimization and evaluation. The broader task includes improving a site until it satisfies rubric criteria such as achieving a Lighthouse score above 90, removing render-blocking resources, and ensuring images are lazy loaded. The source does not spell out Puppeteer’s exact role in that process, but its inclusion suggests it supports web-focused automation or testing within the agent environment.

Its importance in the material comes from showing how developers can shape agent behavior by defining the tools available in the sandbox. Puppeteer serves as an example of the kind of specialized package that can be preloaded to support production-style workflows rather than simple prompt-response interactions.

## Key Relationships
- **Claude Managed Agents** — Puppeteer appears as one of the tools available in an agent sandbox environment.
- **Lighthouse** — Mentioned alongside Puppeteer as pre-installed for the website-performance example.
- **Sandbox environments** — Puppeteer is part of the configured environment developers provide to agents.
- **Isolated containers** — Agents use tools like Puppeteer while operating inside isolated execution containers.
- **GitHub repository mounts** — The environment containing Puppeteer is used after a repository is mounted into the session.
- **Rubric-based evaluation** — Puppeteer is associated with a workflow where Claude iterates until performance criteria are satisfied.

## Open Questions
- What exact capabilities Puppeteer provides in this workflow are not described.
- Whether Puppeteer is used directly by Claude, by supporting scripts, or by another evaluation component is unclear.
- How Puppeteer interacts with Lighthouse in the website optimization example is not explained.
- Whether Puppeteer is generally available in managed agent environments or only in this specific setup is not stated.
- No version, configuration details, or permission constraints for Puppeteer are given.

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
- [[wiki/entities/claude-managed-agents]]
- [[wiki/entities/claude]]
- [[wiki/entities/github]]
- [[wiki/entities/lighthouse]]
- [[wiki/entities/slack]]
- [[wiki/entities/asana]]
- [[wiki/entities/mcp-servers]]
<!-- kb:entity-links:end -->
