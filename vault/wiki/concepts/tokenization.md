---
kind: "concept"
title: "Tokenization"
concept: "Tokenization"
source_count: 1
tags:
  - "concept"
---
# Tokenization

## Definition
Tokenization is the process of representing text as discrete tokens from a fixed vocabulary so a language model can operate as a next-token predictor over those units rather than over whole words or sentences.

## Description
In the documented LLM framing, generation and training both happen at the token level. A model receives prior context as tokens, produces a probability distribution over its vocabulary, and then predicts the next token.

This means the model’s basic unit of processing is not the word or the sentence. The source explicitly distinguishes token-level prediction from reasoning directly over whole words or sentences, which is central to how inference works.

The source describes GPT-4 as using a Byte-Pair Encoding-based tokenization scheme with a vocabulary of 100,277 tokens. Tokenization therefore sits between raw text and model computation: it determines the inventory of symbols the model can predict.

Tokenization also connects to scale. Training corpora are described in token counts, such as FineWeb at roughly 15 trillion tokens, which makes tokens a core unit for both model behavior and dataset size.

## Why It Matters
Tokenization matters because it defines what the model actually predicts. Many intuitions about language models become clearer once they are understood as token predictors rather than systems that directly manipulate words, sentences, or facts.

It also helps explain generation behavior. Since each step chooses the next token from a vocabulary, differences between greedy decoding and sampling naturally lead to different outputs from the same prompt.

Tokenization is relevant to model limits as well. The source links token-by-token generation to the usefulness of step-by-step reasoning, while also stressing that this does not make the model a calculator or a reliable spelling engine.

In practice, tokenization underlies both training scale and deployment behavior. Corpus size, vocabulary design, and inference all depend on tokens, so tokenization is part of the foundation for how modern LLMs are built and how they respond.

## Tensions And Debates
- Human intuition is word- and sentence-centered, while the model’s actual computation is token-centered.
- Token-by-token generation can support longer reasoning traces, but it does not reliably solve arithmetic or spelling failures.
- A large fixed vocabulary enables next-token prediction at scale, but the source does not show how vocabulary design changes downstream assistant quality.
- Output variation can come from sampling at the token level, which improves diversity but reduces determinism compared with greedy decoding.

## Open Questions
- How much of LLM spelling and numeric weakness is a consequence of token-level processing versus later training stages such as SFT or RL?
- How does a Byte-Pair Encoding-based vocabulary shape the kinds of errors or strengths seen in practice?
- What practical tradeoffs come with a vocabulary size such as GPT-4’s 100,277 tokens?
- How strongly does tokenization influence the gap between a base model that continues internet text and an assistant-style model shaped by later training?
- How does tokenization interact with tool use and retrieved context when reducing hallucinations or precision failures?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/supervised-fine-tuning]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:concept-links:end -->
