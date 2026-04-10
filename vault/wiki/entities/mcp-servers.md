---
kind: "entity"
title: "MCP servers"
entity: "MCP servers"
source_count: 1
tags:
  - "entity"
---
# MCP servers

## Who Or What It Is
MCP servers are integration endpoints used by Claude Managed Agents to connect agent workflows to external systems. In the available description, they are specifically associated with posting agent outputs to services such as Slack and Asana.

## Description
Within Claude Managed Agents, MCP servers appear as part of the tool and integration layer that developers can make available to an agent. They are mentioned alongside other agent capabilities such as sandboxed execution, web search, mounted repositories, and event streaming.

Their illustrated role is operational rather than purely computational: an agent can complete work such as tracking pricing changes or generating reports, then send resulting outputs onward through MCP servers. Slack and Asana are the concrete examples named.

MCP servers matter because they extend agents beyond isolated container work into external application workflows. That makes them part of the mechanism by which a managed agent can affect downstream systems, not just produce text in a session.

The available evidence does not describe their protocol, configuration model, security boundaries, or whether they are first-party or third-party components. Only their use as an integration path is established.

## Key Relationships
- **Claude Managed Agents**: MCP servers are presented as one of the integrations available within managed agent workflows.
- **Slack**: Named as a destination to which outputs can be posted through MCP servers.
- **Asana**: Also named as a destination for outputs sent through MCP servers.
- **Agent sessions**: MCP servers appear to be usable from sessions launched by a developer’s application.
- **Tooling and environments**: They are mentioned in the same broader capability set as tools, sandbox environments, and other agent-accessible resources.
- **Approval controls**: The source mentions a single approval gate before posting to Slack, suggesting MCP-mediated actions may participate in review or permission flows, though details are unclear.

## Open Questions
- What does “MCP” stand for in this context, and what protocol or interface do MCP servers implement?
- How are MCP servers configured, authenticated, and scoped for a given agent or session?
- Are MCP servers general-purpose connectors, custom developer-hosted services, or platform-managed integrations?
- What permission and approval controls govern agent actions performed through MCP servers?
- Can MCP servers do more than post outputs, such as read data, trigger workflows, or modify records in connected systems?
- How do MCP servers interact with limited-preview features such as memory, outcomes, or multi-agent orchestration?

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
- [[wiki/entities/puppeteer]]
- [[wiki/entities/slack]]
- [[wiki/entities/asana]]
<!-- kb:entity-links:end -->
