---
kind: "concept"
title: "Supervised fine-tuning"
concept: "Supervised fine-tuning"
source_count: 1
tags:
  - "concept"
---
# Supervised fine-tuning

## Definition
Supervised fine-tuning (SFT) is the training stage that follows pre-training and reshapes a base language model from broad next-token continuation into an assistant-style model by learning from human-annotated examples, especially structured conversations with roles such as Human, Assistant, and System.

## Description
In the three-stage training pipeline described here, SFT sits between pre-training and reinforcement learning. Pre-training produces a base model that predicts tokens well across large internet-scale corpora, but that model is characterized more as an “internet document simulator” than as a ready-made assistant.

SFT changes that behavior by training on curated dialogue data. The examples are structured as conversations, and the role formatting matters: Human, Assistant, and System turns teach the model how to respond in an assistant-like interaction rather than simply continue whatever text pattern appears in context.

The result is a model that is more aligned to question answering, instruction following, and conversational exchange. In this account, much of what users recognize as ChatGPT-like behavior comes from this stage rather than from pre-training alone.

SFT is also used to shape response policies, not just style. One explicit use is training the model to say “I don’t know” in cases of uncertainty, which is presented as one mechanism for reducing hallucinations and overconfident errors.

## Why It Matters
SFT matters because it turns general language competence into usable assistant behavior. Without it, a strong base model may still produce outputs that resemble documents, continuations, or plausible internet text rather than direct, helpful answers.

It also matters for reliability. The model’s knowledge is described as vague neural recollection rather than exact stored facts, so a training stage that teaches refusal behavior can help reduce false certainty when the model does not know an answer.

SFT is important for practical product behavior because it defines how the model interacts with users. Structured conversational training gives the model expectations about roles, instructions, and answer format, which helps make the system feel like an assistant instead of a generic text generator.

It further matters because it works alongside other mitigation methods such as tool use and retrieval. In this framing, assistant quality and hallucination reduction do not come from scale alone; they depend in part on how SFT teaches the model when to answer, when to refuse, and how to operate in a dialogue setting.

## Tensions And Debates
- Assistant behavior is attributed largely to SFT, but the relative contribution of SFT versus later reinforcement learning remains unresolved here.
- Training refusal behavior can reduce hallucinations, but it raises an implied tradeoff between knowing when to abstain and remaining helpful.
- SFT makes models more conversational, yet it does not remove core limitations of token-by-token generation such as numeric mistakes or spelling failures.
- A model fine-tuned as an assistant may still inherit the base model’s tendency to produce plausible continuations, creating tension between stylistic alignment and factual reliability.
- Tool use and retrieved context are presented as important complements, which suggests SFT alone may be insufficient for high-confidence factual performance.

## Open Questions
- How much of modern assistant performance comes from SFT compared with reinforcement learning?
- What data scale, annotation practices, and example formats are most effective for SFT conversational training?
- How should refusal behavior be calibrated so the model avoids hallucinating without becoming overly evasive?
- How are tool-use behaviors represented in supervised examples at scale?
- Which assistant capabilities are reliably teachable through SFT alone, and which require tools or external context?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/learning-chatgpt-and-llms-from-a-former-openai-founding-member]]

## Related Concepts
- [[wiki/concepts/next-token-prediction]]
- [[wiki/concepts/tokenization]]
- [[wiki/concepts/sampling-vs-greedy-decoding]]
- [[wiki/concepts/pre-training]]
- [[wiki/concepts/in-context-learning]]
- [[wiki/concepts/retrieval-augmented-generation]]
- [[wiki/concepts/reinforcement-learning]]
<!-- kb:concept-links:end -->
