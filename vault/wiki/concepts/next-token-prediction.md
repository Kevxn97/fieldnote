---
kind: "concept"
title: "Next-token prediction"
concept: "Next-token prediction"
source_count: 1
tags:
  - "concept"
---
# Next-token prediction

## Definition
Next-token prediction is the core behavior of a large language model: given a sequence of prior tokens, it estimates a probability distribution over the vocabulary and generates the next token, repeating this process token by token rather than reasoning directly over whole words, sentences, or finished answers.

## Description
In this framing, language modeling operates on tokens, not raw characters or complete words. Tokens come from a tokenization scheme such as Byte-Pair Encoding, and a model like GPT-4 is described as working over a vocabulary of 100,277 tokens. At inference time, the model uses the prior context to score possible next tokens and then selects one.

That selection can be done in different ways. Greedy decoding picks the highest-probability token each step, while sampling draws from the probability distribution. This is one reason the same prompt can produce different outputs across runs: the prediction task is the same, but the decoding policy changes the realized continuation.

Next-token prediction is also the basis of pre-training. A base model is trained on large internet-scale corpora to continue text in ways that match patterns in the data. In that form, the model tends to behave more like an “internet document simulator” than a polished assistant, continuing documents plausibly rather than reliably answering questions in the way users expect from chat systems.

Assistant behavior is described as a later layer on top of this predictive core. Supervised fine-tuning reshapes the model using structured conversations with roles such as Human, Assistant, and System, while reinforcement learning is introduced as a further stage intended to improve problem solving through trial and error, though the detailed RL mechanism is not specified here.

## Why It Matters
Next-token prediction explains both the strength and the limits of modern LLMs. It is powerful enough to produce fluent continuations across many domains because pre-training exposes the model to massive text corpora, but that fluency can be mistaken for grounded knowledge or reliable reasoning. The model can continue text confidently even when the underlying answer is false or beyond its training cutoff.

This framing also clarifies why chat behavior is not simply the natural output of a pretrained model. A base model predicts what text should come next in an internet-style document, while assistant-like helpfulness is largely induced through fine-tuning. That distinction matters for interpreting model outputs, failure modes, and evaluation.

In practice, the token-by-token process helps explain common user-facing behavior. Step-by-step prompting can improve performance because generating more intermediate tokens can support extended reasoning-like behavior, yet the model still is not a calculator or a dependable spelling engine. Better-looking reasoning traces do not remove the limits of predictive text generation.

It also shapes mitigation strategies for hallucination and precision failures. If model knowledge is a vague neural recollection rather than exact retrieval, then reducing errors often requires more than scaling the predictor: refusal behavior can be trained, tools such as search or Python can be added, and relevant external context can be injected through prompting or retrieval-augmented generation.

## Tensions And Debates
- Whether next-token prediction should be treated as sufficient to explain assistant behavior, or whether the decisive shift comes from supervised fine-tuning and later reinforcement learning.
- Whether fluent token-by-token continuation constitutes meaningful reasoning, given that step-by-step outputs can help but still leave the model weak at arithmetic and spelling.
- The tradeoff between greedy decoding and sampling: greedy output is more stable, while sampling can be more varied but also less predictable.
- The tension between plausible continuation and factual reliability, especially when a base model confidently extends patterns beyond its training cutoff.
- Whether model “knowledge” should be understood as stored facts or as approximate recollection distributed in parameters, with different implications for trust and evaluation.
- The balance between training refusal behavior and maintaining helpfulness when the model is uncertain.

## Open Questions
- How much of modern assistant quality is attributable to next-token pre-training versus supervised fine-tuning versus reinforcement learning?
- How should reinforcement learning reward open-ended next-token generation for assistant tasks?
- What training procedures most effectively teach a model to know when not to answer without making it overly evasive?
- How should tool use be integrated with next-token prediction at scale beyond isolated examples such as search or code execution?
- When does adding external context outperform relying on the model’s pretrained recollection, and how should that boundary be managed in deployment?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:concept-links:end -->
