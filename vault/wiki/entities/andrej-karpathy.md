---
kind: "entity"
title: "Andrej Karpathy"
entity: "Andrej Karpathy"
source_count: 1
tags:
  - "entity"
---
# Andrej Karpathy

## Who Or What It Is
Andrej Karpathy is described as a former OpenAI founding member who, in a February 2025 video titled *Deep Dive into LLMs like ChatGPT*, explains how large language models work, how they are trained, and where their limits come from.

## Description
Karpathy appears here primarily as an explainer of LLM fundamentals. His presentation frames an LLM as a next-token predictor operating over tokenized text, rather than as a system that directly reasons over whole words, sentences, or facts. He explains inference in token-level terms, including vocabularies, probability distributions, and the practical difference between greedy decoding and sampling.

A central idea associated with his explanation is that pretrained base models are not naturally polished assistants. Instead, they are characterized as “internet document simulators” shaped first by large-scale pre-training and only later turned into assistant-style systems through supervised fine-tuning on structured conversational data. In this framing, assistant behavior is largely layered on top of a broader text-completion capability.

Karpathy’s explanation also emphasizes limitations. Model knowledge is presented as a vague recollection rather than exact fact storage, helping explain hallucinations and confident errors. He highlights several mitigations: training refusal behavior such as “I don’t know,” enabling tool use like search or Python, and adding external context through prompting or retrieval-augmented generation.

He also connects LLM training to reinforcement learning, with an analogy to AlphaGo’s ability to exceed imitation-only performance. However, the detailed RL explanation is incomplete in the available summary, leaving some uncertainty about the specific methods he advocates for open-ended assistant tasks.

## Key Relationships
- **OpenAI** — identified as a former OpenAI founding member.
- **ChatGPT and LLMs** — explains their operation, especially next-token prediction and token-level generation.
- **Pre-training, SFT, and RL** — presents a three-stage training pipeline from base model to assistant-style model.
- **Base models** — characterizes them as “internet document simulators,” not ready-made assistants.
- **FineWeb** — referenced as an example of large-scale pre-training data.
- **GPT-2 and Llama 3** — used as scale anchors in the explanation of model size and training data.
- **Hallucination mitigation** — associates lower error rates with refusal training, tool use, and injected external context.
- **Source: *Learning ChatGPT and LLMs from a Former OpenAI Founding Member*** — summarizes his February 2025 video and its main claims.

## Open Questions
- What specific reinforcement-learning procedure does Karpathy recommend for LLMs beyond the AlphaGo analogy?
- How does he operationalize rewards for open-ended assistant behavior?
- In his framework, how much of modern assistant quality comes from supervised fine-tuning versus reinforcement learning?
- What trade-offs does he see between stronger refusal behavior and overall helpfulness?
- How does he expect tool-use training examples to be structured at scale?

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
- [[wiki/entities/openai]]
- [[wiki/entities/tesla]]
- [[wiki/entities/eureka-labs]]
- [[wiki/entities/fineweb]]
- [[wiki/entities/gpt-2]]
- [[wiki/entities/llama-3]]
- [[wiki/entities/instructgpt]]
<!-- kb:entity-links:end -->
