---
title: "What is Claude Managed Agents?"
source: "https://www.youtube.com/watch?v=NLWiIj47IdI"
author:
  - "[[Claude]]"
published: 2026-04-09
created: 2026-04-10
description: "Claude Managed Agents is a suite of APIs for building production-ready agents. You define the tools, environments, and success criteria. Claude works until the job is done.Outcomes, multi-agent orch"
tags:
  - "clippings"
---
![](https://www.youtube.com/watch?v=NLWiIj47IdI)

Claude Managed Agents is a suite of APIs for building production-ready agents. You define the tools, environments, and success criteria. Claude works until the job is done.  
  
Outcomes, multi-agent orchestration and memory are available as limited research preview. Apply here for early access: http://claude.com/form/claude-managed-agents

## Transcript

**0:02** · Cloud managed agents is a suite of APIs for building and deploying agents at scale.

**0:11** · You define agents with specific tools, personas, and capabilities. You configure sandbox environments with the right packages and network controls. You fire off sessions from your own application and then Claude does the work inside an isolated container with full file system access bash execution and web search.

**0:32** · I have right here a cam bam board sitting on top of manage agent. I drag one over to the in progress and then that fires off a session automatically.

**0:41** · Now the ticket says optimize website performance. So my backend creates a session. It points to an environment that I configured with Lighthouse and Puppeteer pre-installed and mounts my GitHub repo into that container. Claude has the codebase, the tools, and a rubric. Lighthouse score above 90. No render blocking resources. All images lazy loaded. And then we can see here that Claude runs the audit. It starts compressing images, inlinining CSS, deferring scripts. Every tool call streams back to the board in real time through the event stream. So the rubric kicks in. A separate grader running in its own context window evaluates the output against my criteria. Claude reads that feedback, goes back in, fixes what it misses, and then resubmits.

**1:29** · Good. We're up to 96. And note that I can drag a second ticket over while the first is still running. Two sessions, two containers, two separate tasks running in parallel.

**1:41** · So, I have another agent here that's job is to track prices and plan changes across every SAS tool that our company pays for and have a report ready before standup. Common Claude searches the web for current pricing pages, checks for plan tier changes, flags new features that might affect your contracts. It then runs a cost analysis in Python inside of that sandbox. And then it also uses an Excel spreadsheet skill and writes an executive summary. And when the report is ready, Claude posts a link to Slack and creates a review task in a sauna, both through MCP servers. The agent also reads from and writes to a memory store.

**2:19** · Before it starts, it checks what it found last week. After it finishes, it stores what's changed. So, next Monday's report says cloud compute 15% lower since last week instead of listing the same static pricing data.

**2:33** · I have an alert here that fired from my monitoring stack. A custom tool on my backend receives the alert payload and sends it into a new session as a tool result. This session uses multi- aent coordination. A coordinator agent receives the alert and delegates to three specialists, each running in their own context window on the same shared file system.

**2:54** · The specialists report back. The coordinator synthesizes their findings into a single incident summary. And before it posts the update to Slack, the permissions policy fires. And so I see the draft on screen, approve it, and the message goes out. Memory ties all of this together. The coordinator checks past incidents in the memory store and flags a pattern. This looks like the DNS resolution issue from 2 weeks ago that was caused by a misconfigured TTL. So that means that the next time a similar alert fires, the agent starts with that context instead of diagnosing from scratch.

**3:32** · Managed agents gives developers the tools to deliver a fully managed staple agent experience with agents, sessions, environments, tools, MCP, memory, outcomes, and multi- aent coordination.

**3:45** · You define what done looks like. Claude works until it gets there.