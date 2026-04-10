---
kind: "context-pack"
workflow: "ask"
title: "was sind managed agents in claude ?"
query: "was sind managed agents in claude ?"
created_at: "2026-04-10T19:41:22.548Z"
budget_chars: 45000
used_chars: 44863
included_files: 9
---
# Context Pack: was sind managed agents in claude ?

## Snapshot
- Workflow: ask
- Query: was sind managed agents in claude ?
- Budget chars: 45000
- Used chars: 44863
- Included files: 9
- Prioritized files: 8
- Retrieved files: 1

## Top Results
- wiki/sources/what-is-claude-managed-agents.md (source, score 68.50)
- wiki/entities/claude-managed-agents.md (entity, score 68.50)
- wiki/entities/claude.md (entity, score 49.50)
- wiki/system/entity-index.md (system, score 47.25)
- wiki/sources/building-effective-ai-agents.md (source, score 45.50)
- wiki/sources/a-practical-guide-to-building-agents.md (source, score 41.50)
- wiki/system/concept-index.md (system, score 41.25)
- wiki/entities/claude-agent-sdk.md (entity, score 39.50)

## Included Files
- wiki/index.md
- wiki/system/brief.md
- wiki/system/catalog.md
- wiki/system/log.md
- wiki/system/source-index.md
- wiki/system/entity-index.md
- wiki/system/concept-index.md
- wiki/system/question-index.md
- wiki/entities/claude-managed-agents.md

## Prompt Context
# wiki/index.md

---
kind: "index"
title: "Fieldnote"
tags:
  - "index"
  - "home"
---
# Fieldnote

## Overview
- Source pages: 5
- Entity pages: 37
- Concept pages: 40
- Open questions: 0
- Filed outputs: 0
- Catalog: [[wiki/system/catalog]]
- Activity log: [[wiki/system/log]]
- Source index: [[wiki/system/source-index]]
- Entity index: [[wiki/system/entity-index]]
- Concept index: [[wiki/system/concept-index]]
- Question index: [[wiki/system/question-index]]
- Contradictions tracker: [[wiki/system/contradictions]]
- Review queue: [[wiki/system/review-queue]]
- Revision queue: [[wiki/system/revision-queue]]

## Featured Entities
- [[wiki/entities/agents-sdk]]
- [[wiki/entities/andrej-karpathy]]
- [[wiki/entities/anthropic]]
- [[wiki/entities/asana]]
- [[wiki/entities/chrome-web-store]]
- [[wiki/entities/claude-agent-sdk]]
- [[wiki/entities/claude-managed-agents]]
- [[wiki/entities/claude-sonnet-45]]
- [[wiki/entities/claude]]
- [[wiki/entities/edge-add-ons]]
- [[wiki/entities/eureka-labs]]
- [[wiki/entities/fineweb]]

## Featured Concepts
- [[wiki/concepts/agent-computer-interface-aci]]
- [[wiki/concepts/agent-sessions]]
- [[wiki/concepts/agentic-systems]]
- [[wiki/concepts/ai-agents]]
- [[wiki/concepts/augmented-llm]]
- [[wiki/concepts/browser-extension-distribution]]
- [[wiki/concepts/decentralized-handoffs]]
- [[wiki/concepts/evaluator-optimizer]]
- [[wiki/concepts/event-streaming]]
- [[wiki/concepts/guardrails]]
- [[wiki/concepts/highlighting]]
- [[wiki/concepts/human-intervention]]


# wiki/system/brief.md

---
kind: "index"
title: "Workspace Brief"
updated_at: "2026-04-10T19:24:24.301Z"
tags:
  - "index"
  - "brief"
  - "workspace"
---
# Workspace Brief

The workspace is producing artifacts. A review pass will tighten coverage and promote stronger follow-up questions.

## Snapshot
- Stage: In active use
- Health: Unreviewed
- Last sync: Apr 10, 2026, 9:24 PM
- Model: gpt-5.4-mini (ask)
- Sources: 5
- Source pages: 5
- Entities: 37
- Concepts: 40
- Outputs: 1
- Open questions: 427

## Compression
- No context pack captured yet. Run `kb ask`, `kb review`, or `kb autoresearch`.

## Recommended Next Actions
- Refresh the inbox
  - Pull the latest file or clipping into the raw source layer so the workspace keeps compounding.
  - Command: kb update
- Generate a reusable brief
  - Ask one sharp question and save the result as a report, answer, chart brief, or deck.
  - Command: kb ask "What matters most in this source set?" --format report
- Audit the workspace
  - Run a health or review pass to tighten weak areas and surface follow-up work.
  - Command: kb heal

## Open Questions
- Which concrete ACI designs most reliably improve outcomes enough to justify added latency and cost from agentic systems?
- What tool schemas and action formats are easiest for models to use accurately across different domains?
- When should teams prefer Model Context Protocol over custom tool integrations?

## Recent Activity
- 2026-04-10 19:24 · sync · Vault sync — Synced 1 changed source(s) with a targeted graph refresh.
- 2026-04-10 19:22 · ingest · What is Claude Managed Agents? — Added latest source into raw/clips/what-is-claude-managed-agents.md.
- 2026-04-05 20:57 · ask · explain multi-agent-systems — Generated a answer answer.
- 2026-04-05 19:57 · ask · wie baut man mutli-agent-systeme — Generated a answer answer.


# wiki/system/catalog.md

---
kind: "index"
title: "Catalog"
tags:
  - "index"
  - "catalog"
---
# Catalog

Content-oriented inventory of the wiki with one-line summaries.

## Sources
- [[wiki/sources/a-practical-guide-to-building-agents]] - This guide defines **agents** as systems that use an LLM to independently accomplish tasks on a user’s behalf by managing workflow execution, selecting tools, a

[truncated]
- [[wiki/sources/building-effective-ai-agents]] - Anthropic argues that effective LLM agent systems are usually built from simple, composable patterns rather than heavy frameworks or highly specialized abstract

[truncated]
- [[wiki/sources/introduction-to-obsidian-web-clipper]] - This source is a brief Obsidian Help introduction page for Obsidian Web Clipper. It defines Web Clipper as a free browser extension that lets users highlight pa

[truncated]
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]] - This clipped article summarizes Andrej Karpathy’s February 2025 video “Deep Dive into LLMs like ChatGPT,” presenting LLMs as next-token predictors trained in th

[truncated]
- [[wiki/sources/what-is-claude-managed-agents]] - Claude Managed Agents is presented as a suite of APIs for building and deploying agents at scale. In the source, developers define agents by specifying tools, p

[truncated]

## Entities
- [[wiki/entities/agents-sdk]] - Agents SDK appears as a named entity associated with OpenAI’s practical guidance on building AI agents. In the available material, it is connected to agent cons

[truncated]
- [[wiki/entities/andrej-karpathy]] - Andrej Karpathy is described as a former OpenAI founding member who, in a February 2025 video titled *Deep Dive into LLMs like ChatGPT*, explains how large lang

[truncated]
- [[wiki/entities/anthropic]] - Anthropic is the organization credited as the author of *Building Effective AI Agents* and is described there as developing guidance for reliable LLM agent syst

[truncated]
- [[wiki/entities/asana]] - Asana appears as an external service that Claude Managed Agents can post outputs to, using MCP servers as the integration mechanism. The available evidence is b

[truncated]
- [[wiki/entities/chrome-web-store]] - Chrome Web Store is an official installation location referenced for Obsidian Web Clipper on Chrome and other Chromium-based browsers.
- [[wiki/entities/claude-agent-sdk]] - Claude Agent SDK is an Anthropic-related software development kit named in connection with Anthropic’s guidance on building LLM agents. The available evidence p

[truncated]
- [[wiki/entities/claude-managed-agents]] - Claude Managed Agents is a suite of APIs for building and deploying production-ready agents at scale. Developers define an agent’s tools, personas, capabilities

[truncated]
- [[wiki/entities/claude-sonnet-45]] - Claude Sonnet 4.5 is a named entity associated with Anthropic in material about building effective AI agents. The available evidence identifies it as relevant t

[truncated]
- [[wiki/entities/claude]] - Claude is the AI system described as carrying out agent work inside Claude Managed Agents. In the available description, developers define the tools, environmen

[truncated]
- [[wiki/entities/edge-add-ons]] - Edge Add-Ons is an official installation location listed for Obsidian Web Clipper, indicating it is a browser extension distribution channel associated with Mic

[truncated]
- [[wiki/entities/eureka-labs]] - Eureka Labs is a named entity associated with a clipped article summarizing Andrej Karpathy’s February 2025 video on large language models, but the available ma

[truncated]
- [[wiki/entities/fineweb]] - FineWeb is a large internet text corpus used as an example of pre-training data for large language models. It is described as being roughly 44 TB in size and co

[truncated]
- [[wiki/entities/firefox-add-ons]] - Firefox Add-Ons is an official installation location linked from Obsidian Help for obtaining Obsidian Web Clipper on Firefox. In the cited material, it is assoc

[truncated]
- [[wiki/entities/github]] - GitHub appears as a repository host used as an input to Claude Managed Agents workflows. In the described example, a GitHub repository is mounted into an isolat

[truncated]
- [[wiki/entities/gpt-2]] - GPT-2 is a 2019 large language model referenced as an early scale anchor in an overview of how LLMs work. It is described as a 1.6B-parameter model trained on a

[truncated]
- [[wiki/entities/instructgpt]] - InstructGPT appears as an instruction-following, assistant-style language model in the training framework described by Andrej Karpathy: a model built on top of 

[truncated]
- [[wiki/entities/lighthouse]] - Lighthouse appears to be a website-performance auditing tool used in a Claude Managed Agents workflow. In the described example, it is pre-installed in a sandbo

[truncated]
- [[wiki/entities/llama-3]] - Llama 3 is described as a large language model family used as a scale anchor in explanations of modern LLMs, spanning 8B to 405B parameters and trained on 15T t

[truncated]
- [[wiki/entities/mcp-servers]] - MCP servers are integration endpoints used by Claude Managed Agents to connect agent workflows to external systems. In the available description, they are speci

[truncated]
- [[wiki/entities/model-context-protocol]] - Model Context Protocol is a protocol mentioned by Anthropic as one way for an augmented LLM to integrate third-party tools.
- [[wiki/entities/o1]] - o1 is a named entity referenced in *A practical guide to building agents*. The summary does not describe it in detail, but its appearance alongside o3-mini in a

[truncated]
- [[wiki/entities/o3-mini]] - **o3-mini** is an OpenAI model referenced in guidance on building AI agents. It appears as part of the guide’s discussion of the **model** layer in agent design

[truncated]
- [[wiki/entities/obsidian-help]] - Obsidian Help is the documentation surface referenced by the “Introduction to Obsidian Web Clipper” page. In this material, it functions as an official help res

[truncated]
- [[wiki/entities/obsidian-vault]] - An Obsidian vault is the local destination where Obsidian Web Clipper saves highlighted pages and other clipped web content.
- [[wiki/entities/obsidian-web-clipper]] - Obsidian Web Clipper is a free browser extension for highlighting pages and saving web content directly to an Obsidian vault.
- [[wiki/entities/obsidianmdobsidian-clipper]] - `obsidianmd/obsidian-clipper` appears to be the open-source, auditable code repository associated with Obsidian Web Clipper, a free browser extension for highli

[truncated]
- [[wiki/entities/openai-moderation-api]] - The OpenAI moderation API is an OpenAI safety component referenced in the context of building AI agents. It appears as part of the guide’s layered-guardrails ap

[truncated]
- [[wiki/entities/openai]] - OpenAI is an AI organization associated here with the GPT and ChatGPT line of large language models and with Andrej Karpathy, identified as a former founding me

[truncated]
- [[wiki/entities/puppeteer]] - Puppeteer is a tool described as being pre-installed in a Claude Managed Agents sandbox environment used for a website-performance task. In the available eviden

[truncated]
- [[wiki/entities/rivet]] - Rivet is a named entity mentioned in Anthropic’s *Building Effective AI Agents*, but the available evidence does not identify exactly what Rivet is or disambigu

[truncated]
- [[wiki/entities/safari-extensions]] - Safari Extensions is the Safari distribution channel listed for installing Obsidian Web Clipper. In this context, it refers to the official Safari install locat

[truncated]
- [[wiki/entities/slack]] - Slack is an external destination used by Claude Managed Agents workflows for posting outputs, apparently via MCP server integrations. In the available material,

[truncated]
- [[wiki/entities/strands-agents-sdk-by-aws]] - Strands Agents SDK by AWS is an AWS-associated agent SDK named in Anthropic’s *Building Effective AI Agents* as a relevant entity in the broader landscape of ag

[truncated]
- [[wiki/entities/swe-bench-verified]] - SWE-bench Verified is referenced as the setting for Anthropic’s coding-agent work, where tool-interface choices materially affected reliability. The available e

[truncated]
- [[wiki/entities/tesla]] - Tesla is an ambiguously identified entity named in a summary of Andrej Karpathy’s February 2025 video on LLMs. The available material lists Tesla among notable 

[truncated]
- [[wiki/entities/vellum]] - Vellum is a named entity mentioned in Anthropic’s *Building Effective AI Agents*. The material does not explain what Vellum is, what role it plays, or which spe

[truncated]
- [[wiki/entities/websearchtool]] - WebSearchTool is a named entity referenced in *A practical guide to building agents* as part of the tooling ecosystem around AI agents. The guide does not descr

[truncated]

## Concepts
- [[wiki/concepts/agent-computer-interface-aci]] - Agent-computer interface (ACI) is the tool and environment interface through which an LLM agent observes computer state, takes actions, and receives feedback, i

[truncated]
- [[wiki/concepts/agent-sessions]] - Agent sessions are the managed execution units used by Claude Managed Agents: a developer-created runtime in which Claude operates inside an isolated container 

[truncated]
- [[wiki/concepts/agentic-systems]] - Agentic systems are LLM-based systems that go beyond a single model call by combining models with tools, retrieval, memory, and multi-step control. The term is 

[truncated]
- [[wiki/concepts/ai-agents]] - AI agents are LLM-based systems that independently accomplish tasks on a user’s behalf by managing workflow execution, selecting and using tools to gather conte

[truncated]
- [[wiki/concepts/augmented-llm]] - An augmented LLM is a base language model extended with supporting capabilities such as retrieval, tools, and memory so it can do more than respond from its par

[truncated]
- [[wiki/concepts/browser-extension-distribution]] - Browser extension distribution is the delivery of an extension through browser-specific installation channels and support paths. In this material, it refers to 

[truncated]
- [[wiki/concepts/decentralized-handoffs]] - Decentralized handoffs are a multi-agent orchestration pattern in which peer agents transfer execution to one another directly, instead of routing all delegatio

[truncated]
- [[wiki/concepts/evaluator-optimizer]] - Evaluator-optimizer is a workflow pattern in Anthropic’s taxonomy of agentic systems: a predefined orchestration of LLM calls and tools, listed alongside prompt

[truncated]
- [[wiki/concepts/event-streaming]] - Event streaming is the real-time delivery of agent activity back to the application, especially tool calls emitted while a managed agent session is running insi

[truncated]
- [[wiki/concepts/guardrails]] - Guardrails are the explicit safety and control mechanisms that bound how an AI agent operates, including layered checks such as relevance and safety classifiers

[truncated]
- [[wiki/concepts/highlighting]] - Highlighting is a core function of Obsidian Web Clipper in which users mark content on web pages and save that web content directly to an Obsidian vault through

[truncated]
- [[wiki/concepts/human-intervention]] - Human intervention is the use of people as an explicit control point in agent systems, especially to review, approve, or take over when actions are high risk, o

[truncated]
- [[wiki/concepts/in-context-learning]] - In-context learning is the use of prompt-time context to shape an LLM’s next-token predictions without changing its underlying parameters. In the documented usa

[truncated]
- [[wiki/concepts/isolated-containers]] - Isolated containers are sandboxed execution environments used by Claude Managed Agents to run agent sessions with filesystem access, bash execution, web search,

[truncated]
- [[wiki/concepts/local-first-saving]] - Local-first saving is the model in which captured web content is saved directly to a user’s Obsidian vault on the user’s device, with no collection of user data

[truncated]
- [[wiki/concepts/manager-pattern]] - The manager pattern is a multi-agent orchestration approach in which a central manager agent controls workflow execution and delegates sub-tasks to specialized 

[truncated]
- [[wiki/concepts/memory-stores]] - Memory stores are persistent memory capabilities associated with Claude Managed Agents that let information carry across agent work beyond a single session, tho

[truncated]
- [[wiki/concepts/multi-agent-coordination]] - Multi-agent coordination is the orchestration of multiple agent sessions or specialist agents to work on related tasks in parallel or in sequence, with defined 

[truncated]
- [[wiki/concepts/multi-agent-systems]] - Multi-agent systems are agent architectures in which multiple LLM-based agents coordinate to complete a workflow, typically by dividing responsibilities across 

[truncated]
- [[wiki/concepts/natural-language-page-interpretation]] - Natural language page interpretation is an Obsidian Web Clipper capability associated with the Interpreter feature, where a web page can be worked with through 

[truncated]
- [[wiki/concepts/next-token-prediction]] - Next-token prediction is the core behavior of a large language model: given a sequence of prior tokens, it estimates a probability distribution over the vocabul

[truncated]
- [[wiki/concepts/orchestrator-workers]] - Orchestrator-workers is a workflow pattern in Anthropic’s taxonomy of LLM system design. It belongs to the class of predefined orchestration patterns—rather tha

[truncated]
- [[wiki/concepts/parallel-task-execution]] - Parallel task execution is the ability to run multiple agent sessions at the same time, with each session operating in its own isolated container on a separate 

[truncated]
- [[wiki/concepts/parallelization]] - Parallelization is a workflow pattern in LLM systems where multiple model calls are run concurrently along predefined paths, typically either by splitting a tas

[truncated]
- [[wiki/concepts/pre-training]] - Pre-training is the first stage of large language model training, in which a model learns next-token prediction over massive text corpora to produce a base mode

[truncated]
- [[wiki/concepts/prompt-chaining]] - Prompt chaining is a workflow pattern in which multiple LLM prompts are connected through predefined code paths. In Anthropic’s framing, it belongs to the workf

[truncated]
- [[wiki/concepts/reader-mode]] - Reader mode is a documented feature area within Obsidian Web Clipper, presented as a distinct topic alongside clipping, highlighting, and interpreter functions 

[truncated]
- [[wiki/concepts/reinforcement-learning]] - Reinforcement learning is described as the third stage in a ChatGPT-like training pipeline, applied after pre-training and supervised fine-tuning to improve pro

[truncated]
- [[wiki/concepts/retrieval-augmented-generation]] - Retrieval-Augmented Generation, or RAG, is a way of improving LLM outputs by supplying relevant external context in the prompt so the model generates from retri

[truncated]
- [[wiki/concepts/routing]] - Routing is a workflow pattern in LLM-based systems in which task handling follows predefined code paths rather than fully model-directed control. In this contex

[truncated]
- [[wiki/concepts/rubric-based-evaluation]] - Rubric-based evaluation is a way of determining whether an agent task is complete by checking outputs against explicit success criteria, such as measurable perf

[truncated]
- [[wiki/concepts/sampling-vs-greedy-decoding]] - Sampling vs. greedy decoding are two ways an LLM turns its next-token probability distribution into actual output during inference. Greedy decoding follows the 

[truncated]
- [[wiki/concepts/sandbox-environments]] - Sandbox environments are the isolated execution setups used by managed agents, defined by developers to include specific tools, packages, and network controls, 

[truncated]
- [[wiki/concepts/single-agent-systems]] - Single-agent systems are agent architectures in which one LLM-driven agent manages the workflow for a task, uses available tools to gather information or take a

[truncated]
- [[wiki/concepts/supervised-fine-tuning]] - Supervised fine-tuning (SFT) is the training stage that follows pre-training and reshapes a base language model from broad next-token continuation into an assis

[truncated]
- [[wiki/concepts/template-logic]] - Template logic is the logic-related part of Obsidian Web Clipper templating, associated with templates, variables, and filters and used to control how clipped w

[truncated]
- [[wiki/concepts/template-variables-and-filters]] - In Obsidian Web Clipper, template variables and filters are linked customization features within the clipping workflow, associated with templates and template l

[truncated]
- [[wiki/concepts/tokenization]] - Tokenization is the process of representing text as discrete tokens from a fixed vocabulary so a language model can operate as a next-token predictor over those

[truncated]
- [[wiki/concepts/web-clipping]] - Web clipping is the capture of web content from a browser into an Obsidian vault, typically through a browser extension that can save pages and highlights local

[truncated]
- [[wiki/concepts/workflow-execution]] - Workflow execution is the way an agent controls the steps of a task over time: deciding what to do next, selecting and using tools, following instructions and g

[truncated]

## Questions
- None

## Filed Outputs
- None


# wiki/system/log.md

---
kind: "index"
title: "Activity Log"
tags:
  - "index"
  - "log"
---
# Activity Log

Append-only operational history for ingests, syncs, queries, and health passes.

## [2026-04-05 19:56] update | Clippings inbox update
- Summary: Imported 4 clipping file(s), ran a incremental wiki sync, and cleaned the processed inbox files.
- Files:
  - [[raw/clips/introduction-to-obsidian-web-clipper]]
  - [[raw/clips/a-practical-guide-to-building-agents]]
  - [[raw/clips/building-effective-ai-agents]]
  - [[raw/clips/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## [2026-04-05 19:57] ask | wie baut man mutli-agent-systeme
- Summary: Generated a answer answer.
- Files:
  - [[outputs/answers/2026-04-05-answer-wie-baut-man-mutli-agent-systeme]]

## [2026-04-05 20:57] ask | explain multi-agent-systems
- Summary: Generated a answer answer.
- Files:
  - [[outputs/answers/2026-04-05-answer-explain-multi-agent-systems]]

## [2026-04-10 19:22] ingest | What is Claude Managed Agents?
- Summary: Added latest source into raw/clips/what-is-claude-managed-agents.md.
- Files:
  - [[raw/clips/what-is-claude-managed-agents]]

## [2026-04-10 19:24] sync | Vault sync
- Summary: Synced 1 changed source(s) with a targeted graph refresh.
- Files:
  - [[wiki/sources/what-is-claude-managed-agents]]
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


# wiki/system/source-index.md

---
kind: "index"
title: "Source Index"
tags:
  - "index"
  - "sources"
---
# Source Index

- [[wiki/sources/a-practical-guide-to-building-agents]] - This guide defines **agents** as systems that use an LLM to independently accomplish tasks on a user’s behalf by managing workflow execution, selecting tools, a

[truncated]
- [[wiki/sources/building-effective-ai-agents]] - Anthropic argues that effective LLM agent systems are usually built from simple, composable patterns rather than heavy frameworks or highly specialized abstract

[truncated]
- [[wiki/sources/introduction-to-obsidian-web-clipper]] - This source is a brief Obsidian Help introduction page for Obsidian Web Clipper. It defines Web Clipper as a free browser extension that lets users highlight pa

[truncated]
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]] - This clipped article summarizes Andrej Karpathy’s February 2025 video “Deep Dive into LLMs like ChatGPT,” presenting LLMs as next-token predictors trained in th

[truncated]
- [[wiki/sources/what-is-claude-managed-agents]] - Claude Managed Agents is presented as a suite of APIs for building and deploying agents at scale. In the source, developers define agents by specifying tools, p

[truncated]


# wiki/system/entity-index.md

---
kind: "index"
title: "Entity Index"
tags:
  - "index"
  - "entities"
---
# Entity Index

- [[wiki/entities/agents-sdk]] - Agents SDK appears as a named entity associated with OpenAI’s practical guidance on building AI agents. In the available material, it is connected to agent cons

[truncated]
- [[wiki/entities/andrej-karpathy]] - Andrej Karpathy is described as a former OpenAI founding member who, in a February 2025 video titled *Deep Dive into LLMs like ChatGPT*, explains how large lang

[truncated]
- [[wiki/entities/anthropic]] - Anthropic is the organization credited as the author of *Building Effective AI Agents* and is described there as developing guidance for reliable LLM agent syst

[truncated]
- [[wiki/entities/asana]] - Asana appears as an external service that Claude Managed Agents can post outputs to, using MCP servers as the integration mechanism. The available evidence is b

[truncated]
- [[wiki/entities/chrome-web-store]] - Chrome Web Store is an official installation location referenced for Obsidian Web Clipper on Chrome and other Chromium-based browsers.
- [[wiki/entities/claude-agent-sdk]] - Claude Agent SDK is an Anthropic-related software development kit named in connection with Anthropic’s guidance on building LLM agents. The available evidence p

[truncated]
- [[wiki/entities/claude-managed-agents]] - Claude Managed Agents is a suite of APIs for building and deploying production-ready agents at scale. Developers define an agent’s tools, personas, capabilities

[truncated]
- [[wiki/entities/claude-sonnet-45]] - Claude Sonnet 4.5 is a named entity associated with Anthropic in material about building effective AI agents. The available evidence identifies it as relevant t

[truncated]
- [[wiki/entities/claude]] - Claude is the AI system described as carrying out agent work inside Claude Managed Agents. In the available description, developers define the tools, environmen

[truncated]
- [[wiki/entities/edge-add-ons]] - Edge Add-Ons is an official installation location listed for Obsidian Web Clipper, indicating it is a browser extension distribution channel associated with Mic

[truncated]
- [[wiki/entities/eureka-labs]] - Eureka Labs is a named entity associated with a clipped article summarizing Andrej Karpathy’s February 2025 video on large language models, but the available ma

[truncated]
- [[wiki/entities/fineweb]] - FineWeb is a large internet text corpus used as an example of pre-training data for large language models. It is described as being roughly 44 TB in size and co

[truncated]
- [[wiki/entities/firefox-add-ons]] - Firefox Add-Ons is an official installation location linked from Obsidian Help for obtaining Obsidian Web Clipper on Firefox. In the cited material, it is assoc

[truncated]
- [[wiki/entities/github]] - GitHub appears as a repository host used as an input to Claude Managed Agents workflows. In the described example, a GitHub repository is mounted into an isolat

[truncated]
- [[wiki/entities/gpt-2]] - GPT-2 is a 2019 large language model referenced as an early scale anchor in an overview of how LLMs work. It is described as a 1.6B-parameter model trained on a

[truncated]
- [[wiki/entities/instructgpt]] - InstructGPT appears as an instruction-following, assistant-style language model in the training framework described by Andrej Karpathy: a model built on top of 

[truncated]
- [[wiki/entities/lighthouse]] - Lighthouse appears to be a website-performance auditing tool used in a Claude Managed Agents workflow. In the described example, it is pre-installed in a sandbo

[truncated]
- [[wiki/entities/llama-3]] - Llama 3 is described as a large language model family used as a scale anchor in explanations of modern LLMs, spanning 8B to 405B parameters and trained on 15T t

[truncated]
- [[wiki/entities/mcp-servers]] - MCP servers are integration endpoints used by Claude Managed Agents to connect agent workflows to external systems. In the available description, they are speci

[truncated]
- [[wiki/entities/model-context-protocol]] - Model Context Protocol is a protocol mentioned by Anthropic as one way for an augmented LLM to integrate third-party tools.
- [[wiki/entities/o1]] - o1 is a named entity referenced in *A practical guide to building agents*. The summary does not describe it in detail, but its appearance alongside o3-mini in a

[truncated]
- [[wiki/entities/o3-mini]] - **o3-mini** is an OpenAI model referenced in guidance on building AI agents. It appears as part of the guide’s discussion of the **model** layer in agent design

[truncated]
- [[wiki/entities/obsidian-help]] - Obsidian Help is the documentation surface referenced by the “Introduction to Obsidian Web Clipper” page. In this material, it functions as an official help res

[truncated]
- [[wiki/entities/obsidian-vault]] - An Obsidian vault is the local destination where Obsidian Web Clipper saves highlighted pages and other clipped web content.
- [[wiki/entities/obsidian-web-clipper]] - Obsidian Web Clipper is a free browser extension for highlighting pages and saving web content directly to an Obsidian vault.
- [[wiki/entities/obsidianmdobsidian-clipper]] - `obsidianmd/obsidian-clipper` appears to be the open-source, auditable code repository associated with Obsidian Web Clipper, a free browser extension for highli

[truncated]
- [[wiki/entities/openai-moderation-api]] - The OpenAI moderation API is an OpenAI safety component referenced in the context of building AI agents. It appears as part of the guide’s layered-guardrails ap

[truncated]
- [[wiki/entities/openai]] - OpenAI is an AI organization associated here with the GPT and ChatGPT line of large language models and with Andrej Karpathy, identified as a former founding me

[truncated]
- [[wiki/entities/puppeteer]] - Puppeteer is a tool described as being pre-installed in a Claude Managed Agents sandbox environment used for a website-performance task. In the available eviden

[truncated]
- [[wiki/entities/rivet]] - Rivet is a named entity mentioned in Anthropic’s *Building Effective AI Agents*, but the available evidence does not identify exactly what Rivet is or disambigu

[truncated]
- [[wiki/entities/safari-extensions]] - Safari Extensions is the Safari distribution channel listed for installing Obsidian Web Clipper. In this context, it refers to the official Safari install locat

[truncated]
- [[wiki/entities/slack]] - Slack is an external destination used by Claude Managed Agents workflows for posting outputs, apparently via MCP server integrations. In the available material,

[truncated]
- [[wiki/entities/strands-agents-sdk-by-aws]] - Strands Agents SDK by AWS is an AWS-associated agent SDK named in Anthropic’s *Building Effective AI Agents* as a relevant entity in the broader landscape of ag

[truncated]
- [[wiki/entities/swe-bench-verified]] - SWE-bench Verified is referenced as the setting for Anthropic’s coding-agent work, where tool-interface choices materially affected reliability. The available e

[truncated]
- [[wiki/entities/tesla]] - Tesla is an ambiguously identified entity named in a summary of Andrej Karpathy’s February 2025 video on LLMs. The available material lists Tesla among notable 

[truncated]
- [[wiki/entities/vellum]] - Vellum is a named entity mentioned in Anthropic’s *Building Effective AI Agents*. The material does not explain what Vellum is, what role it plays, or which spe

[truncated]
- [[wiki/entities/websearchtool]] - WebSearchTool is a named entity referenced in *A practical guide to building agents* as part of the tooling ecosystem around AI agents. The guide does not descr

[truncated]


# wiki/system/concept-index.md

---
kind: "index"
title: "Concept Index"
tags:
  - "index"
  - "concepts"
---
# Concept Index

- [[wiki/concepts/agent-computer-interface-aci]] - Agent-computer interface (ACI) is the tool and environment interface through which an LLM agent observes computer state, takes actions, and receives feedback, i

[truncated]
- [[wiki/concepts/agent-sessions]] - Agent sessions are the managed execution units used by Claude Managed Agents: a developer-created runtime in which Claude operates inside an isolated container 

[truncated]
- [[wiki/concepts/agentic-systems]] - Agentic systems are LLM-based systems that go beyond a single model call by combining models with tools, retrieval, memory, and multi-step control. The term is 

[truncated]
- [[wiki/concepts/ai-agents]] - AI agents are LLM-based systems that independently accomplish tasks on a user’s behalf by managing workflow execution, selecting and using tools to gather conte

[truncated]
- [[wiki/concepts/augmented-llm]] - An augmented LLM is a base language model extended with supporting capabilities such as retrieval, tools, and memory so it can do more than respond from its par

[truncated]
- [[wiki/concepts/browser-extension-distribution]] - Browser extension distribution is the delivery of an extension through browser-specific installation channels and support paths. In this material, it refers to 

[truncated]
- [[wiki/concepts/decentralized-handoffs]] - Decentralized handoffs are a multi-agent orchestration pattern in which peer agents transfer execution to one another directly, instead of routing all delegatio

[truncated]
- [[wiki/concepts/evaluator-optimizer]] - Evaluator-optimizer is a workflow pattern in Anthropic’s taxonomy of agentic systems: a predefined orchestration of LLM calls and tools, listed alongside prompt

[truncated]
- [[wiki/concepts/event-streaming]] - Event streaming is the real-time delivery of agent activity back to the application, especially tool calls emitted while a managed agent session is running insi

[truncated]
- [[wiki/concepts/guardrails]] - Guardrails are the explicit safety and control mechanisms that bound how an AI agent operates, including layered checks such as relevance and safety classifiers

[truncated]
- [[wiki/concepts/highlighting]] - Highlighting is a core function of Obsidian Web Clipper in which users mark content on web pages and save that web content directly to an Obsidian vault through

[truncated]
- [[wiki/concepts/human-intervention]] - Human intervention is the use of people as an explicit control point in agent systems, especially to review, approve, or take over when actions are high risk, o

[truncated]
- [[wiki/concepts/in-context-learning]] - In-context learning is the use of prompt-time context to shape an LLM’s next-token predictions without changing its underlying parameters. In the documented usa

[truncated]
- [[wiki/concepts/isolated-containers]] - Isolated containers are sandboxed execution environments used by Claude Managed Agents to run agent sessions with filesystem access, bash execution, web search,

[truncated]
- [[wiki/concepts/local-first-saving]] - Local-first saving is the model in which captured web content is saved directly to a user’s Obsidian vault on the user’s device, with no collection of user data

[truncated]
- [[wiki/concepts/manager-pattern]] - The manager pattern is a multi-agent orchestration approach in which a central manager agent controls workflow execution and delegates sub-tasks to specialized 

[truncated]
- [[wiki/concepts/memory-stores]] - Memory stores are persistent memory capabilities associated with Claude Managed Agents that let information carry across agent work beyond a single session, tho

[truncated]
- [[wiki/concepts/multi-agent-coordination]] - Multi-agent coordination is the orchestration of multiple agent sessions or specialist agents to work on related tasks in parallel or in sequence, with defined 

[truncated]
- [[wiki/concepts/multi-agent-systems]] - Multi-agent systems are agent architectures in which multiple LLM-based agents coordinate to complete a workflow, typically by dividing responsibilities across 

[truncated]
- [[wiki/concepts/natural-language-page-interpretation]] - Natural language page interpretation is an Obsidian Web Clipper capability associated with the Interpreter feature, where a web page can be worked with through 

[truncated]
- [[wiki/concepts/next-token-prediction]] - Next-token prediction is the core behavior of a large language model: given a sequence of prior tokens, it estimates a probability distribution over the vocabul

[truncated]
- [[wiki/concepts/orchestrator-workers]] - Orchestrator-workers is a workflow pattern in Anthropic’s taxonomy of LLM system design. It belongs to the class of predefined orchestration patterns—rather tha

[truncated]
- [[wiki/concepts/parallel-task-execution]] - Parallel task execution is the ability to run multiple agent sessions at the same time, with each session operating in its own isolated container on a separate 

[truncated]
- [[wiki/concepts/parallelization]] - Parallelization is a workflow pattern in LLM systems where multiple model calls are run concurrently along predefined paths, typically either by splitting a tas

[truncated]
- [[wiki/concepts/pre-training]] - Pre-training is the first stage of large language model training, in which a model learns next-token prediction over massive text corpora to produce a base mode

[truncated]
- [[wiki/concepts/prompt-chaining]] - Prompt chaining is a workflow pattern in which multiple LLM prompts are connected through predefined code paths. In Anthropic’s framing, it belongs to the workf

[truncated]
- [[wiki/concepts/reader-mode]] - Reader mode is a documented feature area within Obsidian Web Clipper, presented as a distinct topic alongside clipping, highlighting, and interpreter functions 

[truncated]
- [[wiki/concepts/reinforcement-learning]] - Reinforcement learning is described as the third stage in a ChatGPT-like training pipeline, applied after pre-training and supervised fine-tuning to improve pro

[truncated]
- [[wiki/concepts/retrieval-augmented-generation]] - Retrieval-Augmented Generation, or RAG, is a way of improving LLM outputs by supplying relevant external context in the prompt so the model generates from retri

[truncated]
- [[wiki/concepts/routing]] - Routing is a workflow pattern in LLM-based systems in which task handling follows predefined code paths rather than fully model-directed control. In this contex

[truncated]
- [[wiki/concepts/rubric-based-evaluation]] - Rubric-based evaluation is a way of determining whether an agent task is complete by checking outputs against explicit success criteria, such as measurable perf

[truncated]
- [[wiki/concepts/sampling-vs-greedy-decoding]] - Sampling vs. greedy decoding are two ways an LLM turns its next-token probability distribution into actual output during inference. Greedy decoding follows the 

[truncated]
- [[wiki/concepts/sandbox-environments]] - Sandbox environments are the isolated execution setups used by managed agents, defined by developers to include specific tools, packages, and network controls, 

[truncated]
- [[wiki/concepts/single-agent-systems]] - Single-agent systems are agent architectures in which one LLM-driven agent manages the workflow for a task, uses available tools to gather information or take a

[truncated]
- [[wiki/concepts/supervised-fine-tuning]] - Supervised fine-tuning (SFT) is the training stage that follows pre-training and reshapes a base language model from broad next-token continuation into an assis

[truncated]
- [[wiki/concepts/template-logic]] - Template logic is the logic-related part of Obsidian Web Clipper templating, associated with templates, variables, and filters and used to control how clipped w

[truncated]
- [[wiki/concepts/template-variables-and-filters]] - In Obsidian Web Clipper, template variables and filters are linked customization features within the clipping workflow, associated with templates and template l

[truncated]
- [[wiki/concepts/tokenization]] - Tokenization is the process of representing text as discrete tokens from a fixed vocabulary so a language model can operate as a next-token predictor over those

[truncated]
- [[wiki/concepts/web-clipping]] - Web clipping is the capture of web content from a browser into an Obsidian vault, typically through a browser extension that can save pages and highlights local

[truncated]
- [[wiki/concepts/workflow-execution]] - Workflow execution is the way an agent controls the steps of a task over time: deciding what to do next, selecting and using tools, following instructions and g

[truncated]


# wiki/system/question-index.md

---
kind: "index"
title: "Question Index"
tags:
  - "index"
  - "questions"
---
# Question Index

- No pages yet.


# wiki/entities/claude-managed-agents.md

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
