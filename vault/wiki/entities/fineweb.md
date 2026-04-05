---
kind: "entity"
title: "FineWeb"
entity: "FineWeb"
source_count: 1
tags:
  - "entity"
---
# FineWeb

## Who Or What It Is
FineWeb is a large internet text corpus used as an example of pre-training data for large language models. It is described as being roughly 44 TB in size and containing about 15 trillion tokens after preprocessing steps such as URL filtering, text extraction, language filtering, and PII removal.

## Description
FineWeb appears in the context of LLM pre-training, where models learn broad next-token prediction over massive collections of internet text. In that training pipeline, it represents the kind of corpus used to create a base model before later stages such as supervised fine-tuning and reinforcement learning.

Its significance in the material is mostly as a scale reference. The corpus is presented as large enough to illustrate how modern models are trained on far more data than earlier systems, and how pre-training depends on industrial-scale text collection and cleaning rather than raw web scraping alone.

The preprocessing attached to FineWeb is notable because it shapes what kind of text reaches the model. The described pipeline includes filtering URLs, extracting text, filtering by language, and removing personally identifiable information, suggesting that FineWeb is not merely a raw dump but a processed training dataset.

FineWeb also helps explain why a base model behaves like an “internet document simulator.” If a model is trained on corpora such as FineWeb, its default behavior is broad text continuation based on patterns in web-scale documents, not inherently assistant-style dialogue.

## Key Relationships
- **Pre-training:** FineWeb is used as an example of the large corpus on which LLMs are pre-trained.
- **Base models:** Training on corpora such as FineWeb is what produces a base model before assistant tuning.
- **Next-token prediction:** FineWeb supplies the internet-scale text from which models learn continuation behavior token by token.
- **Data preprocessing:** It is associated with URL filtering, text extraction, language filtering, and PII removal.
- **LLM scale comparisons:** FineWeb is cited as roughly **44 TB** and **15 trillion tokens**, making it a scale anchor for modern training data.
- **Llama 3:** The material separately notes that Llama 3 uses **15T training tokens**, placing FineWeb in the same rough scale discussion, though it does not explicitly state that Llama 3 was trained on FineWeb itself.
- **Hallucination context:** Because pre-training on internet corpora teaches broad document continuation, FineWeb indirectly relates to why base models can generate plausible but false continuations.

## Open Questions
- Is FineWeb a single named dataset, a family of datasets, or a shorthand label for a broader processed web corpus?
- Who assembled and maintains FineWeb?
- How much of the stated 44 TB and 15 trillion tokens remains after each preprocessing stage?
- What criteria are used for language filtering, quality filtering, and PII removal?
- Which major models, if any, are explicitly trained on FineWeb rather than on similar corpora?
- How does FineWeb differ from other web-scale pre-training datasets in quality, coverage, and licensing?

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
- [[wiki/entities/gpt-2]]
- [[wiki/entities/llama-3]]
- [[wiki/entities/instructgpt]]
<!-- kb:entity-links:end -->
