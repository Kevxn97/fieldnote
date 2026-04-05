---
kind: "entity"
title: "Llama 3"
entity: "Llama 3"
source_count: 1
tags:
  - "entity"
---
# Llama 3

## Who Or What It Is
Llama 3 is described as a large language model family used as a scale anchor in explanations of modern LLMs, spanning 8B to 405B parameters and trained on 15T tokens.

## Description
In the material, Llama 3 appears primarily as an example of the scale reached by contemporary LLMs. It is contrasted with GPT-2, which is described as a 1.6B-parameter model trained on about 100B tokens, to show how much model size and training data have increased.

The source places Llama 3 inside a broader account of how LLMs work: next-token prediction, tokenization, pre-training on massive text corpora, and later adaptation into assistant-style systems through supervised fine-tuning and reinforcement learning. Llama 3 is not described in product or interface terms; it is referenced as a representative modern model family.

Its importance in the material is illustrative rather than narrative. The model helps ground claims about the scale of present-day training regimes, especially the move to trillions of training tokens, which supports the article’s discussion of base models, assistant behavior, and the limits of model knowledge.

## Key Relationships
- **GPT-2** — used as a comparison point: GPT-2 is described as 1.6B parameters and about 100B training tokens, while Llama 3 is described as 8B to 405B parameters and 15T tokens.
- **Pre-training** — Llama 3 is mentioned in the context of large-scale pre-training as part of the standard LLM training pipeline.
- **Next-token prediction** — the model is framed within the general definition of LLMs as next-token predictors.
- **FineWeb** — the source discusses FineWeb as a massive pre-training corpus of roughly 44 TB and 15 trillion tokens, numerically aligning with the training-token scale cited for Llama 3.
- **Supervised fine-tuning (SFT)** — the broader explanation says assistant-like behavior is layered on top of pretrained models through SFT rather than emerging directly from base-model training.
- **Reinforcement learning** — Llama 3 is situated in a training framework that includes RL after pre-training and SFT, though no Llama 3-specific RL details are given.
- **Andrej Karpathy** — the model is cited within a summary of Karpathy’s explanation of how modern LLMs are built and scaled.

## Open Questions
- Does the 15T-token figure refer to all Llama 3 variants uniformly, or only to particular models in the family?
- Which specific Llama 3 versions correspond to the 8B, intermediate, and 405B parameter points mentioned?
- How much of Llama 3’s assistant quality, in the source’s framework, would come from pre-training versus SFT and RL?
- Was FineWeb actually part of Llama 3’s training data, or is it only presented as an example of corpus scale?
- What behaviors of Llama 3 as a base model versus an assistant-tuned model would differ in practice under the source’s “internet document simulator” framing?

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
- [[wiki/entities/gpt-2]]
- [[wiki/entities/instructgpt]]
<!-- kb:entity-links:end -->
