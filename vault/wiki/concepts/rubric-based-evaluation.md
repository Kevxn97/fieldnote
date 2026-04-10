---
kind: "concept"
title: "Rubric-based evaluation"
concept: "Rubric-based evaluation"
source_count: 1
tags:
  - "concept"
---
# Rubric-based evaluation

## Definition
Rubric-based evaluation is a way of determining whether an agent task is complete by checking outputs against explicit success criteria, such as measurable performance thresholds or required implementation changes, and iterating until those criteria are satisfied.

## Description
In the documented agent workflow, developers define what success looks like up front rather than relying on a single prompt-response exchange. The rubric can include concrete conditions like a Lighthouse score above 90, no render-blocking resources, and lazy loading for all images.

Evaluation is separated from generation in at least one example. A distinct grader operates in its own context window and assesses whether the result meets the specified criteria. If the output falls short, Claude revises the work and submits another attempt.

This makes rubric-based evaluation part of an iterative completion loop. The agent does not simply produce an answer once; it continues working until the rubric indicates that the job is done.

The approach is shown in a production-style setting, including work on a mounted GitHub repository inside an isolated container with tools such as Lighthouse and Puppeteer available for checking the result.

## Why It Matters
Rubric-based evaluation turns “done” into something operational. Instead of vague task completion, developers can encode concrete expectations that an agent must satisfy before a workflow is treated as complete.

That matters especially for production workflows where outputs affect codebases, reports, or downstream systems. Explicit criteria help align agent behavior with developer intent when tasks involve modification, validation, and repeated checking.

It also supports reliability through separation of roles. Using a grader in a separate context window creates an evaluation step that is not identical to the generation step, which can help structure iterative improvement around stated requirements.

More broadly, rubric-driven completion reflects a shift from one-off prompting toward managed execution. The agent is configured to work within tools, environments, and success criteria, then keep iterating until those criteria are met.

## Tensions And Debates
- Rubric-based evaluation is presented through clear examples, but the exact API shape for defining and managing rubrics is not specified.
- A separate grader in its own context window suggests stronger evaluation structure, but the operational boundaries between grader and worker are not fully described.
- Explicit rubrics improve measurability, but the documented examples emphasize technical criteria; it is less clear how broader qualitative goals would be represented.
- The approach depends on the surrounding managed environment, including tools and sandbox setup, so evaluation quality may be tied to environment design rather than rubric text alone.
- Some adjacent capabilities such as outcomes and multi-agent orchestration are only in limited research preview, which leaves open how broadly rubric-based evaluation integrates with those features.

## Open Questions
- How are rubrics represented in the API beyond the examples of success criteria shown?
- What kinds of criteria can be evaluated automatically besides technical checks like Lighthouse scores and resource-loading behavior?
- How does the separate grader decide pass or fail when criteria are partially satisfied?
- Can rubric-based evaluation be combined with parallel sessions or coordinated specialist agents in a general way?
- What approval, review, or policy controls can be inserted between rubric satisfaction and external actions such as posting to Slack or Asana?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/what-is-claude-managed-agents]]

## Related Concepts
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/sandbox-environments]]
- [[wiki/concepts/isolated-containers]]
- [[wiki/concepts/parallel-task-execution]]
- [[wiki/concepts/memory-stores]]
- [[wiki/concepts/multi-agent-coordination]]
- [[wiki/concepts/event-streaming]]
<!-- kb:concept-links:end -->
