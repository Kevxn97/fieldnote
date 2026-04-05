---
kind: "concept"
title: "Pre-training"
concept: "Pre-training"
source_count: 1
tags:
  - "concept"
---
# Pre-training

## Definition
Pre-training is the first stage of large language model training, in which a model learns next-token prediction over massive text corpora to produce a base model that broadly continues text in the style of internet documents rather than behaving as a fully shaped assistant.

## Description
In this training stage, the model is optimized to predict the next token from prior context. It operates at the token level rather than over whole words or sentences, so pre-training teaches statistical continuation across tokenized text.

The output of pre-training is a base model. That base model is described as an “internet document simulator”: it has broad exposure to text patterns and can continue documents, imitate styles, and reproduce familiar structures, but it is not yet inherently organized as a conversational assistant.

Pre-training uses very large corpora. One example given is FineWeb, described as roughly 44 TB and 15 trillion tokens, with preprocessing steps including URL filtering, text extraction, language filtering, and PII removal. Scale anchors in the material include GPT-2 at about 1.6B parameters trained on roughly 100B tokens, and Llama 3 ranging from 8B to 405B parameters with 15T training tokens.

What the model acquires in pre-training is not exact, database-like knowledge. Its knowledge is characterized more as vague neural recollection, which helps explain both useful generalization and failures such as confident false continuations, especially for events beyond the model’s pretraining cutoff.

## Why It Matters
Pre-training creates the foundational capabilities that later stages depend on. Without it, there is no broad language competence for supervised fine-tuning or reinforcement learning to shape into assistant behavior.

It also explains an important practical distinction between base models and chat assistants. A pretrained model may continue text as if it were completing a web page, article, or document, while assistant-style response behavior is largely added later through supervised fine-tuning.

Pre-training matters for understanding model limitations. Because the model predicts likely continuations from learned text patterns, it can memorize seen material, generate plausible but false content, and fail on post-cutoff facts. These behaviors are not edge cases; they follow directly from what pre-training optimizes.

The stage also matters for systems design. Since pretrained knowledge is imperfect recollection, external context, retrieval, search, and tools can outperform asking the model to answer purely from memory.

## Tensions And Debates
- Pre-training gives broad language ability, but assistant-like helpfulness appears to come mainly from later stages rather than from pre-training alone.
- Larger pre-training corpora and models increase capability, but they do not eliminate hallucinations, numeric mistakes, or spelling failures.
- Pre-training can encode useful knowledge, yet that knowledge is not exact retrieval and may degrade into confident false continuation.
- Base models can memorize training material, creating a tradeoff between broad coverage and concerns around reproduction of seen text.
- A model trained to continue internet text may produce document-like behavior that conflicts with expectations for dialogue, instruction following, and calibrated uncertainty.

## Open Questions
- How much of modern assistant quality is attributable to pre-training versus supervised fine-tuning and reinforcement learning?
- What pre-training choices most affect whether a base model behaves more like a document completer versus a robust assistant after alignment?
- How do data filtering steps such as language filtering and PII removal change downstream capability and failure modes?
- How much memorization arises during pre-training at different scales of model size and token count?
- What are the most effective ways to compensate for the pretraining cutoff when a model is asked about newer events?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:concept-links:end -->
