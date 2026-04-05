---
kind: "concept"
title: "In-context learning"
concept: "In-context learning"
source_count: 1
tags:
  - "concept"
---
# In-context learning

## Definition
In-context learning is the use of prompt-time context to shape an LLM’s next-token predictions without changing its underlying parameters. In the documented usage here, it primarily refers to supplying relevant external information in the prompt so the model can answer from the provided context instead of relying only on its vague recollection from pretraining.

## Description
LLMs generate text token by token from prior context. Because of that, what appears in the prompt can materially change the model’s behavior at inference time. In-context learning uses this property by adding information the model should condition on before it produces an answer.

The documented form is mainly external context injection: giving the model relevant material directly in the prompt, or retrieving it through a Retrieval-Augmented Generation setup and then placing it into the context window. This is presented as a practical alternative to asking the model to answer purely from memory.

This use of context differs from changing the model through pre-training, supervised fine-tuning, or reinforcement learning. Those stages alter the model ahead of deployment, while in-context learning works at runtime by steering the same model with additional input.

The term can be broader in general LLM discussion, but the material here centers on prompt-supplied knowledge rather than parameter updates. Its role is closely tied to reducing hallucinations and precision failures by grounding generation in supplied evidence.

## Why It Matters
Model knowledge is described as a vague neural recollection rather than exact stored facts. That makes prompt-supplied context especially important when accuracy matters, because the model can produce confident but false continuations when it is forced to answer from imperfect memory alone.

In-context learning matters as one of the main mitigation strategies for hallucination. Alongside refusal training and tool use, context injection is identified as a practical way to improve answers without assuming the model already knows the needed facts.

It also helps explain why strong assistant behavior is not just a property of pretraining. A base model may act more like an internet document simulator, while carefully structured context can push outputs toward the task actually intended by the user.

In operational settings, this makes external knowledge access a central part of LLM system design. If retrieved or supplied context is better than the model’s internal recollection, then prompt construction and retrieval quality become important determinants of answer quality.

## Tensions And Debates
- Prompt-supplied context can improve factuality, but it does not remove the model’s token-by-token generation limits or make it a reliable calculator or spelling engine.
- Refusal training and context injection both reduce unsupported answers, but the balance between knowing when to answer and when to say “I don’t know” remains a tradeoff.
- If a model can memorize seen material from pretraining, it may sometimes appear knowledgeable even without added context, which can obscure when grounding is actually necessary.
- Retrieval or prompt context may outperform memory, but the material does not specify when external context is sufficient versus when tool use such as search or code execution is still needed.
- The term “in-context learning” can be used broadly, while the documented emphasis is narrower: supplying relevant external context through prompts or RAG.

## Open Questions
- How should relevant external context be selected and structured so that it reliably improves answers at scale?
- When does prompt-time context injection outperform tool use, and when is retrieval alone not enough?
- How much assistant quality in practice comes from supervised fine-tuning versus strong in-context grounding?
- What are the trade-offs between stronger refusal behavior and greater use of supplied context for uncertain queries?
- How should systems detect when the model is relying on vague recollection instead of the provided context?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:concept-links:end -->
