---
kind: "entity"
title: "InstructGPT"
entity: "InstructGPT"
source_count: 1
tags:
  - "entity"
---
# InstructGPT

## Who Or What It Is
InstructGPT appears as an instruction-following, assistant-style language model in the training framework described by Andrej Karpathy: a model built on top of a pretrained base model and reshaped through supervised fine-tuning, with reinforcement learning presented as a further stage for improving performance through trial and error.

## Description
The material distinguishes a base model from an assistant. A base model is described as an “internet document simulator” trained to predict the next token over large text corpora. By contrast, the assistant-style behavior associated with instruction following does not arise automatically from pre-training; it is produced by later training stages.

Within that framing, InstructGPT aligns with the post-pretraining transformation of a model into something that responds in conversational form. The source describes supervised fine-tuning on human-annotated dialogues using roles such as Human, Assistant, and System. That stage is presented as what turns a generic text continuator into a model that behaves more like a usable assistant.

The source also places reinforcement learning after supervised fine-tuning. That RL stage is described only at a high level and is incomplete in the available material, but it is intended to improve problem solving beyond imitation alone. In that sense, InstructGPT is tied to the broader idea of instruction-following models that are not just pretrained predictors, but post-trained assistants.

This matters because the source uses this distinction to explain both capabilities and limits. Assistant behavior, refusal behavior, tool use, and reduced hallucination are presented as outcomes of post-training choices rather than natural properties of the base model itself.

## Key Relationships
- **Base models:** InstructGPT is contrasted with the pretrained base model, which is described as an “internet document simulator.”
- **Supervised fine-tuning (SFT):** The source presents SFT as the stage that reshapes a pretrained model into an assistant-style system, which closely matches the role associated with InstructGPT.
- **Reinforcement learning:** InstructGPT is connected to a third training stage meant to improve problem solving through trial and error, though the detailed method is not given.
- **ChatGPT-like assistants:** The source argues that assistant behavior is largely a post-training product rather than the default behavior of a pretrained LLM.
- **Human/Assistant/System dialogue format:** These structured roles are described as part of the data used to create assistant-style behavior.
- **Hallucination mitigation:** Refusal training, tool use, and adding external context are presented as ways assistant-style models can become more reliable.

## Open Questions
- Does “InstructGPT” here refer specifically to a named OpenAI model, or more generally to the instruction-following assistant stage in the training pipeline?
- How much of InstructGPT-style behavior, in this framing, comes from supervised fine-tuning versus reinforcement learning?
- What exact reinforcement learning procedure is used after SFT for open-ended assistant tasks?
- How are rewards or evaluators defined for instruction-following behavior?
- What trade-offs exist between stronger refusal behavior and overall helpfulness in an instruction-tuned model?

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
- [[wiki/entities/llama-3]]
<!-- kb:entity-links:end -->
