---
kind: "source"
title: "Learning ChatGPT and LLMs from a Former OpenAI Founding Member"
source_id: "src_learning-chatgpt-and-llms-from-a-former-openai-founding-member_fda4e0a1"
source_kind: "text"
raw_path: "raw/clips/learning-chatgpt-and-llms-from-a-former-openai-founding-member.md"
source_url: "https://substack.com/home/post/p-157447415"
authors:
  - "[[JiaKuan Su]]"
published: "2025-02-20"
created: "2026-04-05"
description: "Summary of key points from Andrej Karpathy's video, covering the inner working of LLMs"
source_tags:
  - "clippings"
related_assets:
tags:
  - "source"
  - "text"
---
# Learning ChatGPT and LLMs from a Former OpenAI Founding Member

## Summary
This clipped article summarizes Andrej Karpathy’s February 2025 video “Deep Dive into LLMs like ChatGPT,” presenting LLMs as next-token predictors trained in three stages: pre-training, supervised fine-tuning (SFT), and reinforcement learning (RL). It explains inference at the token level, including tokenization, probability distributions over vocabularies, and the difference between greedy decoding and sampling.

The source’s main practical contribution is its framing of base models as “internet document simulators” rather than ready-made assistants. In this telling, pre-training teaches broad text continuation over massive corpora such as FineWeb, while SFT reshapes the model into a conversational assistant by training on structured dialogue data with roles like Human, Assistant, and System.

The article also emphasizes limits and mitigations. It argues that model knowledge is a kind of vague recollection, so hallucinations can be reduced by training refusal behavior, adding tools such as web search or code execution, and supplying external context in the prompt. It further stresses that token-by-token generation makes step-by-step reasoning helpful, but does not turn an LLM into a calculator or a reliable spelling engine.

The RL section is incomplete in this source bundle. The article begins to connect LLM RL to AlphaGo’s ability to exceed imitation-only performance, but the detailed explanation of how RL is applied to LLMs is truncated.

## Key Points
- The source defines an LLM’s core behavior as predicting the next token from prior context, not directly reasoning over whole words or sentences.
- It states that GPT-4 uses a vocabulary of 100,277 tokens and a Byte-Pair Encoding-based tokenization scheme.
- It distinguishes greedy decoding from sampling, noting that sampling is a common reason identical prompts can yield different answers.
- It presents a three-stage training pipeline: pre-training on large internet corpora to form a Base Model, SFT on human-annotated conversations to form an assistant-style model, and RL to improve problem solving through trial and error.
- For pre-training data, it highlights FineWeb as roughly 44 TB and 15 trillion tokens, with preprocessing including URL filtering, text extraction, language filtering, and PII removal.
- It uses GPT-2 and Llama 3 as scale anchors: GPT-2 is described as a 1.6B-parameter 2019 model trained on about 100B tokens, while Llama 3 spans 8B to 405B parameters and uses 15T training tokens.
- It argues that base models often continue text like documents rather than answer like assistants, can memorize seen material, and can confidently generate false continuations for events beyond their pretraining cutoff.
- It describes three major ways to reduce hallucinations or precision failures: teach “I don’t know” refusals during SFT, let the model call tools such as search or Python, and inject relevant external context via the prompt or RAG.

## Entities
- Andrej Karpathy
- OpenAI
- Tesla
- Eureka Labs
- FineWeb
- GPT-2
- Llama 3
- InstructGPT

## Concepts
- Next-token prediction
- Tokenization
- Sampling vs. greedy decoding
- Pre-training
- Supervised fine-tuning
- In-context learning
- Retrieval-Augmented Generation
- Reinforcement learning

## Contradictions And Updates
- The source challenges the common shorthand that ChatGPT-like behavior is what a pretrained LLM “naturally” does; it argues that assistant behavior is largely a second-stage SFT product layered on top of a base model that mainly simulates internet text.
- It refines the idea of “model knowledge” by describing it as vague neural recollection rather than exact stored facts, which helps explain why adding retrieved context can outperform asking from memory alone.
- It pushes back on the assumption that step-by-step outputs make LLMs inherently reliable reasoners: more tokens can help thinking, but the model still is not a calculator and still makes basic numeric and spelling mistakes.
- It updates a simplistic view of hallucination mitigation by showing multiple mechanisms: refusal training, tool use, and context injection, not just larger models or more data.

## Open Questions
- How does the article’s intended RL explanation operationalize rewards for open-ended assistant tasks? The source cuts off before detailing this.
- What specific RL training procedures, evaluators, or reward models does Karpathy recommend for LLMs beyond the AlphaGo analogy?
- How much of modern assistant quality, in this framework, comes from SFT versus RL?
- What trade-offs does the source see between refusal behavior and helpfulness when training “know what it knows” responses?
- How are tool-use training examples structured at scale beyond the single search-format illustration shown here?

## Raw References
- raw/clips/learning-chatgpt-and-llms-from-a-former-openai-founding-member.md

<!-- kb:source-links:start -->
## Knowledge Graph
- Source: [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]
- Raw: [[raw/clips/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]
- [[wiki/entities/andrej-karpathy]]
- [[wiki/entities/openai]]
- [[wiki/entities/tesla]]
- [[wiki/entities/eureka-labs]]
- [[wiki/entities/fineweb]]
- [[wiki/entities/gpt-2]]
- [[wiki/entities/llama-3]]
- [[wiki/entities/instructgpt]]
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:source-links:end -->
