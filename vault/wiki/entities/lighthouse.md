---
kind: "entity"
title: "Lighthouse"
entity: "Lighthouse"
source_count: 1
tags:
  - "entity"
---
# Lighthouse

## Who Or What It Is
Lighthouse appears to be a website-performance auditing tool used in a Claude Managed Agents workflow. In the described example, it is pre-installed in a sandbox environment alongside Puppeteer and is used as part of explicit success criteria for improving a website, including achieving a Lighthouse score above 90.

## Description
Lighthouse is mentioned in the context of production-style agent tasks where a backend creates a session, mounts a GitHub repository, and gives Claude access to an environment tailored for web optimization work. Within that environment, Lighthouse is one of the installed tools available to the agent.

Its main role in the example is evaluative. A separate grader checks whether a website optimization task satisfies a rubric that includes a Lighthouse score threshold, removal of render-blocking resources, and lazy loading of images. Claude then revises its work until those criteria are met.

Lighthouse matters because it helps turn “improve this site” into a measurable completion target. Rather than ending with a single response, the agent can iterate against concrete standards, and Lighthouse is one of the named signals used to determine whether the work is done.

The source does not define Lighthouse in detail, so some ambiguity remains between Lighthouse as a tool in the environment and Lighthouse as the score or metric used in the grading rubric.

## Key Relationships
- **Claude Managed Agents**: Lighthouse is part of an example workflow built with Claude Managed Agents.
- **Sandbox environments**: Lighthouse is described as pre-installed in the agent’s environment.
- **Puppeteer**: Lighthouse is paired with Puppeteer in the same website-performance setup.
- **GitHub repository**: Claude works on a mounted repo while trying to satisfy criteria that include Lighthouse performance targets.
- **Rubric-based evaluation**: A grader checks whether the task meets conditions such as “Lighthouse score above 90.”
- **Website optimization tasks**: Lighthouse is used in a concrete example focused on improving site performance.
- **Iterative completion**: Claude revises and resubmits work until the Lighthouse-related rubric is satisfied.

## Open Questions
- Is Lighthouse being used only for scoring, or also for producing detailed diagnostics that guide revisions?
- What exact Lighthouse metric or report is meant by “Lighthouse score above 90”?
- How is Lighthouse invoked inside the managed agent workflow: directly by Claude, through a script, or through another tool?
- What output from Lighthouse is visible in the event stream or to the separate grader?
- How tightly is Lighthouse integrated with Puppeteer in the described environment?

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
- [[wiki/entities/puppeteer]]
- [[wiki/entities/slack]]
- [[wiki/entities/asana]]
- [[wiki/entities/mcp-servers]]
<!-- kb:entity-links:end -->
