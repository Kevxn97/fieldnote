---
kind: "entity"
title: "Slack"
entity: "Slack"
source_count: 1
tags:
  - "entity"
---
# Slack

## Who Or What It Is
Slack is an external destination used by Claude Managed Agents workflows for posting outputs, apparently via MCP server integrations. In the available material, it appears as a communication endpoint rather than as a system being operated directly.

## Description
Claude Managed Agents examples include generating reports and posting the results to Slack. The source groups Slack with Asana as downstream systems that agents can interact with through MCP servers.

Slack’s role in these examples is tied to production-style automation rather than one-off prompting. An agent can complete work, produce an output, and then send that output into Slack as part of a larger workflow.

The material also implies some human-governed control around Slack actions. It mentions a single approval gate before posting to Slack, suggesting that at least some Slack-bound actions may be reviewed before execution.

Slack matters here as a concrete example of where agent work can be delivered after analysis, monitoring, or reporting tasks are completed.

## Key Relationships
- Connected to **Claude Managed Agents** as a destination for agent-generated outputs.
- Linked to **MCP servers**, which are the integration mechanism described for posting to Slack.
- Paired with **Asana** in examples of external systems agents can post to.
- Appears in workflows involving **report generation** and operational task completion.
- Associated with an **approval gate** before posting, indicating some action-review step in the demonstrated flow.

## Open Questions
- What specific Slack actions are supported beyond posting outputs?
- What permissions and policy controls govern agent access to Slack?
- How is the approval gate implemented before Slack posting?
- Does Slack integration require a dedicated MCP server per workspace or a more general connector?
- Can multiple agent sessions coordinate Slack actions, or is posting handled only by a single session?

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
- [[wiki/entities/asana]]
- [[wiki/entities/mcp-servers]]
<!-- kb:entity-links:end -->
