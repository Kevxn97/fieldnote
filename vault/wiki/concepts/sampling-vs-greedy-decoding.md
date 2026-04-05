---
kind: "concept"
title: "Sampling vs. greedy decoding"
concept: "Sampling vs. greedy decoding"
source_count: 1
tags:
  - "concept"
---
# Sampling vs. greedy decoding

## Definition
Sampling vs. greedy decoding are two ways an LLM turns its next-token probability distribution into actual output during inference. Greedy decoding follows the highest-probability token at each step, while sampling draws from the distribution, which is one common reason the same prompt can produce different answers across runs.

## Description
LLMs generate text token by token. For each new position, the model produces a probability distribution over its vocabulary based on the prior context, then a decoding rule chooses the next token.

Greedy decoding takes the most likely next token at each step. This makes generation follow the model’s strongest continuation path, producing a more fixed response pattern for a given prompt and model state.

Sampling uses the model’s distribution to select among possible next tokens rather than always taking the top one. Because that choice can vary from run to run, sampling introduces output variation even when the prompt is unchanged.

These decoding choices sit at the inference layer rather than the training pipeline. They operate on models that were trained as next-token predictors and later shaped by stages such as supervised fine-tuning into assistant-style behavior.

## Why It Matters
Decoding choice directly affects whether outputs are repeatable or variable in practice. A user may see different answers to the same prompt not because the model was retrained, but because sampling was used during token generation.

This matters because LLM behavior is fundamentally a sequence of local next-token decisions. The decoding rule influences how the model’s learned probability distribution becomes a concrete answer, continuation, or dialogue turn.

Decoding also should not be confused with a cure for core model limits. Token-by-token generation and longer step-by-step outputs can help with reasoning, but they do not make the model a calculator or a reliable spelling engine.

In assistant settings, decoding is only one part of output quality. Hallucination reduction in the documented material relies more on refusal training, tool use, and injecting external context than on decoding choice alone.

## Tensions And Debates
- Determinism versus variability: greedy decoding is more fixed, while sampling is a common source of different answers to the same prompt.
- Inference-time control versus training-time shaping: decoding changes how tokens are chosen, but assistant behavior is also heavily influenced by supervised fine-tuning and later reinforcement learning.
- Step-by-step generation versus actual reliability: producing more tokens can support reasoning traces, but neither decoding approach removes basic weaknesses in arithmetic or spelling.
- Output diversity versus consistency: sampling allows multiple plausible continuations, while greedy decoding commits to the model’s single strongest continuation at each step.

## Open Questions
- Which assistant tasks benefit more from greedy decoding, and which benefit more from sampling?
- How should decoding choice interact with refusal behavior trained during supervised fine-tuning?
- Does sampling worsen false but confident continuations, or is hallucination primarily governed by model knowledge limits and missing external context?
- How should decoding be chosen when tools such as search or code execution are available?
- How much of perceived assistant quality comes from decoding strategy versus supervised fine-tuning and reinforcement learning?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:concept-links:end -->
