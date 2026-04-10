---
kind: "entity"
title: "Claude"
entity: "Claude"
source_count: 1
tags:
  - "entity"
---
# Claude

## Who Or What It Is
Claude is the AI system described as carrying out agent work inside Claude Managed Agents. In the available description, developers define the tools, environments, personas, capabilities, and success criteria, and Claude performs the work in isolated execution contexts until the specified job is complete.

## Description
Claude is presented as more than a single prompt-response model call. Within Claude Managed Agents, it operates through sessions launched from a developer’s application, using sandboxed containers with filesystem access, bash execution, and web search.

Its role is to execute production-style workflows. Examples include auditing and modifying a mounted GitHub repository, tracking SaaS pricing changes across the web, generating reports, posting outputs to Slack and Asana through MCP servers, and responding to monitoring alerts through coordinated specialist agents.

Claude is also described as working iteratively against explicit completion criteria. In the website-performance example, a separate grader evaluates the results against a rubric such as Lighthouse score thresholds, removal of render-blocking resources, and lazy loading of images; Claude then revises and resubmits until the criteria are met.

The description associates Claude with parallel sessions, isolated and shared execution contexts, and persistent memory. However, the same material states that outcomes, multi-agent orchestration, and memory are only available as a limited research preview, so the scope of those capabilities remains only partially confirmed.

## Key Relationships
- **Claude Managed Agents:** Claude is the system that executes work within this suite of APIs.
- **Agent sessions:** Claude operates through sessions started from a developer’s application.
- **Sandbox environments and isolated containers:** Claude works inside isolated containers with configured tools, packages, filesystem access, bash execution, and web access controls.
- **Rubric-based evaluation:** Claude can iterate on tasks until a separate grader determines that explicit success criteria are satisfied.
- **GitHub repositories:** Claude is described as auditing and modifying mounted repositories in at least one example workflow.
- **MCP servers:** Claude can send outputs to external systems such as Slack and Asana through MCP integrations.
- **Parallel task execution:** Multiple Claude sessions can run simultaneously in separate containers.
- **Memory and multi-agent coordination:** These capabilities are mentioned in connection with Claude, but only as limited research preview features.

## Open Questions
- Is “Claude” here primarily the base model, the managed execution system, or a combined product/runtime label?
- What exact permissions and safeguards govern Claude’s filesystem, bash, network, and posting actions in production use?
- How does Claude coordinate specialist agents when multi-agent orchestration is enabled?
- How are Claude’s memory capabilities structured, scoped, and governed across sessions or organizations?
- What API-level controls determine when Claude stops, retries, or asks for approval during a workflow?

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
- [[wiki/entities/github]]
- [[wiki/entities/lighthouse]]
- [[wiki/entities/puppeteer]]
- [[wiki/entities/slack]]
- [[wiki/entities/asana]]
- [[wiki/entities/mcp-servers]]
<!-- kb:entity-links:end -->
