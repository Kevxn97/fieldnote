---
kind: "entity"
title: "OpenAI"
entity: "OpenAI"
source_count: 1
tags:
  - "entity"
---
# OpenAI

## Who Or What It Is
OpenAI is an AI organization associated here with the GPT and ChatGPT line of large language models and with Andrej Karpathy, identified as a former founding member. In this material, it matters mainly as the institutional setting behind examples used to explain how modern assistant-style LLMs are trained and how they behave.

## Description
OpenAI appears primarily through people and model lineage rather than through organizational history. Andrej Karpathy is presented as a former OpenAI founding member, and the discussion centers on LLMs like ChatGPT. GPT-2 and GPT-4 are used as concrete reference points for scale, tokenization, and inference behavior.

The models associated with OpenAI are used to illustrate a three-stage training picture: pre-training, supervised fine-tuning, and reinforcement learning. In that framing, a base model first learns broad next-token prediction over large internet text corpora, then supervised fine-tuning reshapes it into an assistant that follows structured dialogue roles such as Human, Assistant, and System.

A key distinction in this account is between a base model and an assistant-style model. The base model is described as more like an “internet document simulator” than a ready-made assistant, while later tuning stages produce the conversational behavior people associate with ChatGPT-like systems.

OpenAI-related examples also anchor several practical limitations of LLMs. These systems can hallucinate, rely on vague recollection rather than exact stored facts, and benefit from mitigations such as refusal training, tool use like search or Python, and adding external context through prompting or retrieval.

## Key Relationships
- **Andrej Karpathy** — identified as a former OpenAI founding member whose 2025 video frames the discussion.
- **ChatGPT** — the main assistant-style example used to explain how LLMs behave after tuning.
- **GPT-4** — cited for tokenization details, including a vocabulary of 100,277 tokens.
- **GPT-2** — used as an earlier scale anchor, described here as a 1.6B-parameter 2019 model trained on about 100B tokens.
- **InstructGPT** — listed alongside OpenAI as a related entity in the discussion of assistant-style model shaping.
- **Supervised fine-tuning (SFT)** — the stage that turns a broadly pretrained model into a conversational assistant.
- **Reinforcement learning (RL)** — presented as the stage intended to improve problem solving beyond imitation, though its detailed application is left incomplete.
- **Hallucination mitigation** — connected to refusal behavior, tool calling, and adding external context or RAG.

## Open Questions
- How does OpenAI operationalize reinforcement learning rewards for open-ended assistant tasks?
- How much of assistant quality in OpenAI-style systems comes from supervised fine-tuning versus reinforcement learning?
- What specific evaluators, reward models, or RL procedures are used beyond the AlphaGo analogy mentioned here?
- How does OpenAI balance refusal behavior with helpfulness when training models to say “I don’t know”?
- How are tool-use examples structured at scale for search, code execution, or other external actions?

<!-- kb:entity-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]

## Related Entities
- [[wiki/entities/andrej-karpathy]]
- [[wiki/entities/tesla]]
- [[wiki/entities/eureka-labs]]
- [[wiki/entities/fineweb]]
- [[wiki/entities/gpt-2]]
- [[wiki/entities/llama-3]]
- [[wiki/entities/instructgpt]]
<!-- kb:entity-links:end -->
