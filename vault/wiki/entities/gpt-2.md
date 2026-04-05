---
kind: "entity"
title: "GPT-2"
entity: "GPT-2"
source_count: 1
tags:
  - "entity"
---
# GPT-2

## Who Or What It Is
GPT-2 is a 2019 large language model referenced as an early scale anchor in an overview of how LLMs work. It is described as a 1.6B-parameter model trained on about 100B tokens, mainly to help contrast earlier LLM scale with later systems such as Llama 3.

## Description
Within the source’s general framing of LLMs, GPT-2 sits in the category of models understood through next-token prediction and large-scale pre-training. The material does not focus on GPT-2’s internals or product form; it uses GPT-2 primarily as a concrete historical example.

GPT-2 appears in a scaling comparison. The source pairs it with Llama 3, noting that GPT-2 is 1.6B parameters with roughly 100B training tokens, while Llama 3 ranges from 8B to 405B parameters and uses 15T training tokens. That comparison highlights how much model size and training data have increased across generations.

Its significance here is contextual rather than exhaustive. GPT-2 helps illustrate the earlier end of the LLM timeline in a discussion centered on pre-training, supervised fine-tuning, reinforcement learning, and the difference between base models and assistant-style systems. No further architectural details, datasets, or capability claims are provided beyond its date, parameter count, and training-token estimate.

## Key Relationships
- **Llama 3:** used as the main comparison point to show the jump from earlier LLM scale to more recent model sizes and token counts.
- **Pre-training:** tied to the source’s broader discussion of LLMs being trained on massive token corpora before later tuning stages.
- **Next-token prediction:** falls under the source’s general explanation of LLM behavior as predicting the next token from context.
- **Andrej Karpathy:** appears in a summary of Karpathy’s explanation of LLMs and their training pipeline.
- **2019:** identified as a model from 2019, marking it as an earlier generation in the timeline presented.

## Open Questions
- Does “GPT-2” here refer to a specific 1.6B-parameter variant or to the GPT-2 family more broadly?
- Which training dataset or datasets make up the cited roughly 100B tokens?
- How, if at all, is GPT-2 meant to relate to the source’s later stages of supervised fine-tuning and reinforcement learning, rather than pre-training alone?
- What capabilities or limitations does the source intend readers to infer from GPT-2’s scale relative to newer models?

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
- [[wiki/entities/openai]]
- [[wiki/entities/tesla]]
- [[wiki/entities/eureka-labs]]
- [[wiki/entities/fineweb]]
- [[wiki/entities/llama-3]]
- [[wiki/entities/instructgpt]]
<!-- kb:entity-links:end -->
