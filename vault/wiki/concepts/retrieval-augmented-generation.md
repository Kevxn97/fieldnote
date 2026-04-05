---
kind: "concept"
title: "Retrieval-Augmented Generation"
concept: "Retrieval-Augmented Generation"
source_count: 1
tags:
  - "concept"
---
# Retrieval-Augmented Generation

## Definition
Retrieval-Augmented Generation, or RAG, is a way of improving LLM outputs by supplying relevant external context in the prompt so the model generates from retrieved material instead of relying only on its internal, approximate recollection.

## Description
LLMs are described as next-token predictors whose built-in knowledge behaves more like vague neural memory than exact fact storage. In that setting, RAG adds information from outside the model at inference time, giving the model concrete context to continue from.

Within the documented mitigation strategies for hallucinations and precision failures, RAG is one of three highlighted approaches alongside refusal training and tool use such as web search or Python. Its role is specifically to inject relevant external context into the prompt.

RAG is especially useful when a model would otherwise answer from pretraining-era memory. Base models can confidently continue text in ways that sound plausible but are false, particularly for events beyond their knowledge cutoff. Retrieved context changes the immediate evidence available to the model during generation.

The concept sits near in-context learning and tool use, but its core idea here is straightforward: improve generation by grounding the model on supplied information rather than asking it to answer from memory alone.

## Why It Matters
RAG matters because the source characterizes model knowledge as imprecise recollection. If the model is not a reliable store of exact facts, then adding relevant external material can produce better answers than unaided recall.

It also matters as a practical response to hallucination. The documented material does not treat hallucination reduction as something solved only by larger models or more training data. Instead, it points to a toolkit of interventions, with context injection through RAG as a central one.

RAG is also important because pretrained models are not naturally aligned to behave like dependable assistants. A base model may simulate internet documents rather than answer questions faithfully. Providing retrieved context helps steer generation toward grounded response behavior in the moment.

In operational terms, RAG offers a way to extend usefulness beyond the model’s pretraining cutoff. When the model would otherwise generate confident but unsupported continuations, retrieved context can supply the evidence it lacks.

## Tensions And Debates
- RAG reduces hallucinations by grounding outputs, but the material does not specify how much it helps relative to refusal training or tool use.
- Injecting external context improves factual grounding, but the boundary between simple prompt context, explicit retrieval, and broader tool use is only loosely drawn.
- If model knowledge is vague recollection, retrieved context may outperform memory alone, yet the source does not define when retrieval should replace direct answering.
- Grounding generation with context can improve precision, but the documented material does not detail tradeoffs such as prompt length, relevance filtering, or failure from poor retrieval.
- RAG is presented as a mitigation rather than a full solution; token-by-token generation still does not make the model a calculator or guarantee reliable reasoning.

## Open Questions
- How should relevant external context be selected and formatted so the model uses it reliably?
- In practice, when is RAG preferable to tool calling such as web search or code execution?
- How much of assistant reliability comes from RAG versus supervised fine-tuning that teaches refusal and conversational behavior?
- What failure modes appear when retrieved context is incomplete, outdated, or weakly related to the query?
- How should RAG interact with “I don’t know” behavior when retrieved evidence is absent or ambiguous?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:concept-links:end -->
