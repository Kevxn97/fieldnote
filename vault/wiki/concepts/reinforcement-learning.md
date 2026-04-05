---
kind: "concept"
title: "Reinforcement learning"
concept: "Reinforcement learning"
source_count: 1
tags:
  - "concept"
---
# Reinforcement learning

## Definition
Reinforcement learning is described as the third stage in a ChatGPT-like training pipeline, applied after pre-training and supervised fine-tuning to improve problem solving through trial and error rather than imitation alone.

## Description
In the material, reinforcement learning appears in a specific meaning: post-training for large language models, not a general survey of RL methods. Pre-training produces a base model that predicts next tokens over large internet-scale corpora, and supervised fine-tuning reshapes that model into an assistant using structured dialogue data. Reinforcement learning then serves as an additional stage intended to push performance beyond what supervised examples alone provide.

The central intuition is that imitation is not always enough. The comparison to AlphaGo suggests that a system can exceed purely copied human behavior when it is optimized through feedback on outcomes. In the LLM setting, that idea is presented as improving assistant behavior and problem solving via trial and error.

The available description does not spell out the exact reward mechanism, optimization procedure, or evaluator design for open-ended assistant tasks. What is clear is the role reinforcement learning is meant to play: it is a later-stage training method used to refine a conversational model after it has already learned language broadly from pre-training and assistant formatting from supervised fine-tuning.

## Why It Matters
Reinforcement learning matters because it marks the transition from a model that can mimic patterns in data to one that is further optimized for better task performance. In this framing, pre-training alone yields an “internet document simulator,” and supervised fine-tuning makes it assistant-like; reinforcement learning is the stage associated with improving quality beyond those imitation-based foundations.

It also matters because it helps explain why modern assistants are not just raw next-token predictors trained on internet text. The documented pipeline treats assistant behavior as layered: broad language modeling first, then dialogue behavior, then trial-and-error optimization. That makes reinforcement learning part of the explanation for why assistant models can differ from base models in practical usefulness.

The AlphaGo analogy gives reinforcement learning strategic importance. It implies that post-training can be used not only to copy existing responses but to search for behaviors that outperform straightforward imitation. For assistant systems, that raises the prospect of better problem solving, not just cleaner formatting or more conversational tone.

At the same time, its importance is partly defined by uncertainty. The material points to reinforcement learning as a major stage, but leaves its concrete mechanics underexplained. That gap matters because the balance between supervised fine-tuning and reinforcement learning appears central to understanding where assistant quality actually comes from.

## Tensions And Debates
- How much assistant quality comes from supervised fine-tuning versus reinforcement learning remains unresolved.
- The AlphaGo analogy suggests RL can exceed imitation, but open-ended language tasks may be harder to reward than games with clearer outcomes.
- Reinforcement learning is presented as improving problem solving, yet the exact training procedures for LLMs are not specified here.
- The concept is somewhat ambiguous in practice: it can refer broadly to RL as a machine learning paradigm, but here it refers narrowly to a post-SFT stage in LLM training.
- If reinforcement learning is used to shape assistant behavior, there may be a tradeoff between stronger behavioral control and preserving broad helpfulness, though the details are not developed.

## Open Questions
- How are rewards operationalized for open-ended assistant tasks?
- What specific RL procedures, evaluators, or reward models are used in this LLM setting?
- How much performance gain over supervised fine-tuning alone is attributed to reinforcement learning?
- In what ways does the AlphaGo-style “beyond imitation” analogy hold or break down for language models?
- How does reinforcement learning interact with refusal behavior, tool use, and other methods used to reduce hallucinations or precision failures?

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
- [[wiki/concepts/retrieval-augmented-generation]]
<!-- kb:concept-links:end -->
