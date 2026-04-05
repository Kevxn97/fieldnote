---
title: "Learning ChatGPT and LLMs from a Former OpenAI Founding Member"
source: "https://substack.com/home/post/p-157447415"
author:
  - "[[JiaKuan Su]]"
published: 2025-02-20
created: 2026-04-05
description: "Summary of key points from Andrej Karpathy's video, covering the inner working of LLMs"
tags:
  - "clippings"
---
In February 2025, Andrej Karpathy uploaded a detailed tutorial video on his YouTube channel: [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI), where he explores the fundamental workings of Large Language Models (LLMs). This video, spanning 3.5 hours, dissects how powerful models like ChatGPT and DeepSeek are built. This article summarizes key insights, related knowledge, and relevant resources, providing valuable learning material for those serious about learning AI.

![](https://www.youtube.com/watch?v=7xTGNNLPyMI)

### Who Should Read This Article?

1. **If you plan to watch the video** – Read this article first to get a foundational understanding before diving deeper into the video.
2. **If you're interested in how modern AI works** – This article can help you decide whether investing time in the full video is worthwhile. Alternatively, you may start with a [simpler introductory video](https://www.youtube.com/watch?v=zjkBMFhNj_g).
3. **If you’re looking for a straightforward way to master AI fundamentals** in an era where AI is everywhere.

### About Andrej Karpathy

[Andrej Karpathy](https://karpathy.ai/) was one of OpenAI’s founding members and previously served as the director of AI at Tesla. He is now the founder of [Eureka Labs](https://eurekalabs.ai/), an initiative focused on integrating AI with education.

Beyond his contributions to AI development, Karpathy is well known for AI education. He was the primary designer and instructor for Stanford’s first deep learning course, [CS231n](https://cs231n.stanford.edu/), and has uploaded several high-quality AI tutorials on his [YouTube channel](https://www.youtube.com/@AndrejKarpathy). His company is also developing an [LLM101n](https://github.com/karpathy/LLM101n) course to further AI education.

---

## Basic Mechanism of LLMs: Next-Word Prediction

Before diving into LLM training, it's essential to understand how LLMs operate during inference, i.e., when they are used after training.

The core principle: **An LLM predicts the next possible token based on prior** ***context*** —which includes user input and previously generated tokens.

For example, if the previous tokens are *cat*, *sat*, *on*, *a*, a well-trained LLM might predict that the next token is *mat*. The context then expands to *cat*, *sat*, *on*, *a*, *mat*, and the model continues predicting the next token until a stopping condition is met.

![](https://substackcdn.com/image/fetch/$s_!C2Uf!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F751e1b4e-d3e5-40ca-af46-756a5ae0b1c6_1924x700.png)

An LLM predicts the next possible token based on prior context

### A More Precise View: LLMs Work at Token Level

Rather than processing words directly, LLMs operate on **tokens**. A token could be:

- A single word (*cat*)
- A letter (*c*)
- A Chinese character (*貓*)
- An emoji (*🐱*)
- More likely to be a *subword* (*##at*)

Every LLM has its own *vocabulary*, which contains a fixed number of tokens, each mapped to a unique ID. The process of converting text into tokens is called **tokenization**.

For example, GPT-4’s vocabulary consists of 100,277 tokens, and its tokenization algorithm is based on [Byte-Pair Encoding](https://arxiv.org/abs/1508.07909). A phrase like *|Viewing Single* might be tokenized as *|* 、 *View* 、 *ing* 、 *Single* (IDs: *91*, *860*, *287*, *11579*).

> You can experiment with tokenization using [this website](https://tiktokenizer.vercel.app/?model=cl100k_base) (select `cl100k_base` from the top right corner).

![](https://substackcdn.com/image/fetch/$s_!aT8q!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c534c6-47bd-4a7a-851b-c403a6557166_1907x817.png)

An example of tokenization

At each step of LLM inference, the input consists of a sequence of tokens (context), and the model predicts the next token. For example, in the first step, the input is *91*, and the predicted token is *860*. In the second step, the input becomes *91*, *860*, and the model predicts *287*, and so on.

> If you want to learn more about tokenization, you can check out the [article from Hugging Face](https://huggingface.co/docs/transformers/tokenizer_summary).

![](https://substackcdn.com/image/fetch/$s_!6L8Y!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F91906a92-241c-48b0-b93f-a942876c0aa7_855x385.png)

Steps of LLM Inference

### A More Precise View: LLMs Predict Probability of Each Token.

An LLM does not directly output a single token. Instead, it generates a probability distribution over all tokens in the vocabulary and then selects a token based on that probability distribution.

The simplest approach is *greedy decoding*, where the model always chooses the token with the highest probability. However, this method usually does not produce the best results. Therefore, a more common approach is *sampling*, where a token is selected based on the probability distribution.

For example, in the case below:

- The token *19438* (*Direction*) has a 2% probability of being selected.
- The token *11799* (*Case*) has a 1% probability of being selected.
- The token *3962* (*Post*) has a 4% probability of being selected.

Due to this randomness, when using models like ChatGPT, asking the same question twice may result in different answers.

![](https://substackcdn.com/image/fetch/$s_!Ivqs!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ffa8b0f-c8a1-46df-95a2-9417ea60d19d_939x309.png)

LLM predicts the probability of each token

## The Three Stages of LLM Training

Using the process of learning a subject as an example, one would first acquire a large amount of background knowledge from the textbook, then follow detailed explanations to complete exercises (imitating experts), and finally, when solving real-world problems, go through a process of trial and error to learn how to solve problems independently.

1. **Pre-Training**: In this stage, a large amount of internet documents is collected and used as training data to develop the *Base Model*.
2. **Supervised Fine-Tuning (SFT)**: The Base Model can only recite texts (internet documents), so we need to train it on a relatively small set of human-annotated (expert-labeled) data. For example, it learns how an "AI assistant converses with humans," resulting in the *SFT Model*.
3. **Reinforcement Learning (RL)**: Based on the SFT Model, this stage helps it learn how to solve problems through continuous trial and error, producing the *RL Model*. The problems include both closed-ended questions with fixed answers and open-ended questions without fixed answers.

![](https://substackcdn.com/image/fetch/$s_!WlWh!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F110ad58f-1de1-41ad-979a-2b8bd96fb61c_1362x1114.png)

Karpathy's analogy for the three stages of LLM training

## Stage 1: Pre-training

### Preparing Training Data

The example dataset demonstrated by Karpathy is [FineWeb](https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1), which is approximately 44 TB in size and contains 15 trillion tokens. This dataset is created by downloading a large number of web documents from the internet and then applying various preprocessing steps, such as:

- URL Filtering: Removing certain webpages, such as adult content.
- Text Extraction: Extracting plain text content from the raw HTML of webpages.
- Language Filtering: Removing as much non-target language data as possible to ensure the model primarily learns a specific language (e.g., English).
- PII Removal: Removing potentially sensitive personal information, such as ID numbers and addresses.

![](https://substackcdn.com/image/fetch/$s_!GmyE!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5d614a4c-c424-4564-8090-f446f9bddea8_1786x672.png)

FineWeb's data preprocessing process

### Tokenizing the Training Data

Since LLMs operate on tokens rather than raw text, the entire dataset is tokenized before training begins.

![](https://substackcdn.com/image/fetch/$s_!HNKo!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F083f8772-e038-44ee-ab9c-89a0996cf87b_2474x995.png)

Before and after tokenizing the dataset

### Training Neural Networks

An LLM model is essentially an *artificial neural network*, which includes its network architecture and *weights*. The training process repeatedly follows these steps:

1. Randomly select a sequence of consecutive tokens from the training data, along with the next token. (The length has an upper limit, known as *maximum context width*, such as 8,000 tokens.)
2. Use these tokens as the context and input them into the model, and the model predicts a probability distribution.
3. Treat the next token as the *ground truth*, compare it with the model’s predicted probability distribution, and update the weights accordingly.

In the example below, the ground truth token is *3962* (*Post*), and the model initially predicts it with a 4% probability. If the training process is correct, the next time the model encounters the same input, the predicted probability for *3962* (*Post*) should be higher than 4% after weight updates.

![](https://substackcdn.com/image/fetch/$s_!5B26!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F423f9d89-a81f-45ee-8b8a-8bc4927c7d9f_922x401.png)

LLM first predicts probabilities and then compares them with the ground truth

The current number of LLM weights is basically measured in billions. As for the design of neural networks, the most fundamental one is based on *Transformer* architecture.

> If you want to understand Transformer, you can try [the interactive webpage](https://bbycroft.net/llm).

![](https://substackcdn.com/image/fetch/$s_!FyD5!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F088f6236-2c29-4710-83c6-d639908237b5_1226x393.png)

looking inside the LLM model from a mathematical perspective

What we do in pretraining is make the LLM learn to recite all web documents token by token, so it can be seen as an *internet document simulator*.

### Case: GPT-2

[GPT-2](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) was released by OpenAI in 2019. It has 1.6 billion parameters, a maximum context width of 1,024 tokens, and training data of approximately 100 billion tokens. By modern standards, both the model and data size are considered quite small, but GPT-2 can be regarded as the predecessor of contemporary LLMs, built upon the Transformer architecture.

Karpathy previously released a [C language implementation of GPT-2](https://github.com/karpathy/llm.c/discussions/677). On a machine with eight H100 GPUs, the cost of training for 24 hours was $672.

### Case: Llama 3

[Llama 3](https://arxiv.org/abs/2407.21783) was released by Meta in 2024 and includes a series of models of different sizes, ranging from 8 billion to 405 billion parameters. The training data consists of 15 trillion tokens.

> Note: In the figure below, the absence of "Instruct" indicates a Base Model at this stage, while the presence of "Instruct" represents a second-stage SFT Model.

![zoomable](https://substackcdn.com/image/fetch/$s_!-OPr!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F192ccd36-a848-490b-812e-3980cc174ebd_1739x631.png)

Llama 3 model list

Next, we will use Llama 3's Base Model for demonstration. When we input *“What is 2+2?”*, it does not answer the question like ChatGPT normally, but instead continues the input as if writing an article. Remember, we treat the Base Model as an internet document simulator, so its behavior will resemble writing an article on the internet.

![](https://substackcdn.com/image/fetch/$s_!TwE2!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9162bfe3-5003-4a74-a354-4fa10524f6e9_1456x696.png)

Llama 3 test

One more obvious example: when we input the first sentence from the [Zebra Wikipedia page](https://en.wikipedia.org/wiki/Zebra), its output is almost identical to its original content.

![](https://substackcdn.com/image/fetch/$s_!-yx3!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c45e84e-d1a9-4988-8646-e978f7f83ed1_1449x813.png)

Llama 3 test

![](https://substackcdn.com/image/fetch/$s_!AzZk!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b7becc8-e1c2-4d7c-8831-0e43e025b8b9_1401x966.png)

Zebra Wikipedia page

So an extended question is that a Base Model is very good at remembering things it has seen, but for things it has not seen, it is very likely to confidently spouting nonsense, which is the so-called *hallucination problem*. For example, Llama 3's pretraining data was cut off at the end of 2023, so if you input the first sentence of the Wikipedia page for the [2024 U.S. presidential election](https://en.wikipedia.org/wiki/2024_United_States_presidential_election), what it outputs next would be completely inconsistent with reality.

![](https://substackcdn.com/image/fetch/$s_!M9Ow!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51b73c43-6e69-42f7-bb03-0afc123368bd_1444x893.png)

Llama 3 test

![](https://substackcdn.com/image/fetch/$s_!kvqO!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fae83cb2c-1d46-438f-9c99-0c2a7dfd41a4_1390x944.png)

Wikipedia page for the 2024 U.S. presidential election

Does the Base Model have any real use? Besides being used for creative ideation, it can actually achieve some practical purposes through prompt design. For example, we can first show a few English and Chinese word pairs in the input, then add the English word we want to translate (*window*), and the model is capable of providing the correct translation. This is what is known as *[In-Context Learning](https://www.lakera.ai/blog/what-is-in-context-learning#:~:text=In%2Dcontext%20learning%20\(ICL\)%20is%20a%20technique%20where%20task,without%20fine%2Dtuning%20the%20model.)*, achieved through a *few-shot prompt* that demonstrates a few examples.

![](https://substackcdn.com/image/fetch/$s_!AT9y!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa81e3f60-be2a-46c2-9243-ed56676bea30_2086x700.png)

llama 3 test

> If you want to run the examples above yourself, first register an account on [Hyperbolic](https://app.hyperbolic.xyz/), then go [here](https://app.hyperbolic.xyz/models/llama31-405b-base-bf-16) to use the Llama 3 model. Except for the last example, where `max tokens` should be set to a very small value, you can keep the default value of `512` for the others.

## Stage 2: Supervised Fine-Tuning

The main goal of the second stage is to develop an AI assistant similar to ChatGPT that can engage in question-and-answer interactions. In a conversation, multiple roles are typically involved, including the *Human* (user), the *Assistant* (the AI assistant, sometimes referred to as *AI*), and the *System*, which is usually used to establish context and character settings.

![](https://substackcdn.com/image/fetch/$s_!CY2Q!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe26a584-7d80-4328-ae14-dbea1c6ccf17_765x688.png)

Example of a conversation between a user and an AI assistant

What we need to do is fine-tune the Base Model using different training data to obtain the SFT Model.

### Preparing a Conversations Dataset and Training It in the Same Way

To be more specific, we train the LLM to simulate the entire conversation process. The task for the LLM remains the same: predicting the next token based on a sequence of preceding tokens. Therefore, the training method is the same as pretraining, but the training data must follow a conversational format.

There is no standard format for conversations—each model can define its own structure. For example, in GPT-4o, a role’s message follows this format:  
*<|im\_start|>role<|im\_sep|>content<|im\_end|>*, where *<|im\_start|>*, *<|im\_sep|>*, and *<|im\_end|>* are special tokens introduced in this stage.

> If you want to try the following example yourself, please visit [this webpage](https://tiktokenizer.vercel.app/?model=gpt-4o) (select `gpt-4o` in the top right corner).

![zoomable](https://substackcdn.com/image/fetch/$s_!Vz5N!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0000189f-5eef-448b-9ed5-3b793a99b411_1115x676.png)

Tokenization test

The key to this stage is the quality of the conversations dataset, which should cover as many topics and scenarios as possible (e.g., Q&A, summarization, translation, and code generation). The first to attempt this was OpenAI's [InstructGPT](https://arxiv.org/abs/2203.02155), released in 2022. At the time, they invested a large amount of human effort to manually write ideal responses that an assistant should provide in different situations, creating a dataset of one million conversations. These manually written responses needed to follow several principles, including *helpful*, *truthful*, and *harmless*.

> An important aspect of **"** helpful **"** is the ability to understand human *intent*.

![](https://substackcdn.com/image/fetch/$s_!zfXg!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faeebc5ee-a779-4c9f-8b6c-0c4d2ee2145f_1206x974.png)

Principles for collecting InstructGPT’s conversations dataset

InstructGPT did not publicly release its dataset, so we should look at some open-source alternatives. The following example comes from [OpenAssistant/oasst1](https://huggingface.co/datasets/OpenAssistant/oasst1):

![](https://substackcdn.com/image/fetch/$s_!VykE!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6e3d4d34-4d23-4966-803d-b19b0b57e560_1189x497.png)

Example of a conversation from OpenAssistant/oasst1

In today's era, we no longer need to manually create the datasets from scratch. Instead, we can first have an LLM generate an initial version, and then humans can refine it—such as in [UltraChat](https://github.com/thunlp/UltraChat).

### Mitigating Hallucination Problem #1: Learning to Refuse to Answer What It Doesn't Know

Returning to the previously mentioned hallucination problem, how can we prevent an LLM from confidently generating false information? One approach is for the LLM to *Know What It Knows.*

For example, when asked ***"** Who is JiaKuan Su?**"***, the Falcon-7B-Instruct model, which lacks this capability, would generate a random answer, while GPT-4o, which has this ability, would respond that it does not know and requires additional information.

![](https://substackcdn.com/image/fetch/$s_!BA91!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F786761c8-0019-4b5b-af30-699baf27df46_759x392.png)

Falcon-7B-Instruct test

![](https://substackcdn.com/image/fetch/$s_!ntjt!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9869aaab-058e-439d-8da8-8db2792b6815_1500x491.png)

GPT-4o test

To equip an LLM with this capability, we can include questions in the training dataset that go beyond the knowledge contained within the LLM itself. The responses to such questions should be **"** *I don't know* **"** or similar answers.

We can generate this data using a *probing* method:

1. Based on factual content (from Wikipedia or other sources), use another LLM to generate several questions along with their correct answers.
2. Input these questions into the target LLM being trained and collect its responses.
3. Use another LLM to compare the responses with the correct answers. If they do not match, add a conversation pair *(question, "I don't know")* to the training dataset.

For concrete examples, refer to the video from `1:27:45` to `1:32:15`.

![](https://substackcdn.com/image/fetch/$s_!h1Sm!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffbf6209c-630e-4b2e-af91-bdd330e2caff_1122x120.png)

Example of AI Assistant Refusals

### Mitigating Hallucination Problem #2: Using Tools

Another way to mitigate hallucinations is to allow the LLM to use external *tools*, such as performing a web search for a given query and then generating a response based on the search results. For example, when we allow GPT-4o to use the search function, the response to ***"** Who is JiaKuan Su?**"*** is generally correct.

![](https://substackcdn.com/image/fetch/$s_!n-vJ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F986d9f35-1b89-4422-ac38-3372eeff29ed_1501x945.png)

Testing GPT-4o using search tools

To enable an LLM to learn how to use tools, we can include relevant data in the training dataset. The example below illustrates this process:

1. The assistant does not answer the question directly.
	1. First, it clarifies: *Should I perform a web search?* (*<SEARCH\_START>* special token).
		2. Then, it clarifies *what to search for* (*“Who is Orson Kovacs”*).
		3. It pauses momentarily and calls the tool to perform the search (*<SEARCH\_END>* special token).
2. The retrieved search results are placed in ***\[...\]*** here.
3. Only then does it generate the actual response.

![](https://substackcdn.com/image/fetch/$s_!8C8u!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0bb037e2-76b6-4dbe-a474-8fffd4727811_1124x314.png)

Training data example to let LLM use tools

### The Knowledge Contained in an LLM Is a Form of Vague Recollection

Since LLM itself is a neural network, the internal knowledge within the model is *vague*. In some cases, if we want LLM to provide more precise answers, we need to add *working memory* in LLM’s *context window*, which means adding some (external) context before LLM generates tokens.

For example, if we want LLM to summarize Chapter 1 of *Pride and Prejudice*, one way is to ask the question directly. Another way is to include the full text of Chapter 1 in your input, which may yield a more accurate answer.

![](https://substackcdn.com/image/fetch/$s_!bWoM!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F107227f3-4f0c-4758-86b5-1b1987c711f3_1480x652.png)

GPT-4o test: answering the question directly

![](https://substackcdn.com/image/fetch/$s_!Y2bF!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faea96a89-42f2-4192-9f4b-de2534d08af7_1485x957.png)

GPT-4o test: providing chapter 1 before answering

This characteristic can be extended and applied in different ways, such as:

- [RAG (Retrieval-Augmented Generation)](https://www.promptingguide.ai/research/rag), commonly used for question-answering in specific knowledge domains
- Modifying the system prompt to override LLM’s default persona

### LLM Works at Token Level, and it Requires (More) Tokens to Think

When dealing with complex problems or questions that require mathematical calculations or reasoning, the way to give LLM a better chance of obtaining the correct answer is to go *step by step*: instead of directly outputting the final result, break the problem down into smaller steps, obtain intermediate answers, and then arrive at the final result.

![](https://substackcdn.com/image/fetch/$s_!1qQY!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F83b23a07-6124-4fbd-986c-a56d5d363fea_1483x1102.png)

GPT-4o test

To enable LLM to have this capability, the way training data is labeled is crucial.

For example, in the image below, when annotators write answers, the method on the right is better than the one on the left because LLM outputs tokens sequentially. The left-side data makes LLM more likely to output an answer first (which is often incorrect) before showing the reasoning process. On the other hand, the right-side approach guides LLM to go through the process first before reaching the final answer.

![](https://substackcdn.com/image/fetch/$s_!avGV!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa70e55fe-20ef-458e-a8ff-cd19f61388f2_1360x513.png)

[Source](https://www.youtube.com/watch?v=7xTGNNLPyMI)

> Supplementary Note: Besides training data methods, we can also guide LLM to take a step-by-step approach by using [Chain-of-Thought Prompting](https://www.promptingguide.ai/techniques/cot) during inference stage.

However, even if LLM has this step-by-step ability, it does not guarantee that the result will always be correct, especially in mathematical calculations. The fundamental nature of *LLM is using a neural network to predict the next token*, which is fundamentally different from how a calculator performs operations.

For example, when asked ***"** What is bigger, 9.11 or 9.9?**"***, GPT-4o or other LLMs are highly likely to give the wrong answer. (The correct answer should be *9.9(0) > 9.11*.)

![](https://substackcdn.com/image/fetch/$s_!ViDh!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F571ff0c0-d739-4c6b-adf4-998528b1257b_1491x560.png)

GPT-4o test

We can allow LLM to use tools to handle mathematical problems by inputting the required equation into a calculator or executing code (such as using a *Python Interpreter*). After obtaining an accurate calculation result, LLM can then determine the final answer.

![](https://substackcdn.com/image/fetch/$s_!aEHa!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c5297f8-45d6-4b7c-8e11-616f05996941_1494x1036.png)

GPT-4o test

Beyond mathematical problems, LLMs are also not very good at *spelling*.

For example, in the image below, the correct answer should be *"Uqts"* instead of ***"** Uiuo"*. This is because *LLM processes information in units of tokens*, and a single Token is not necessarily a single letter or word.

Similarly, using tools could help solve these types of issues.

![](https://substackcdn.com/image/fetch/$s_!6EUb!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6f31cd22-e6bc-41ec-abea-b08741d2bc45_1500x474.png)

GPT-4o test: without tools

![](https://substackcdn.com/image/fetch/$s_!9qsZ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44f7e640-7c6d-4647-af62-f78e9de8f6a7_1895x324.png)

Tokenization test

![](https://substackcdn.com/image/fetch/$s_!kNGe!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd5daab9c-4ea9-4203-a79d-9d31cfbb4d21_1483x1061.png)

GPT-4o test: using tools

## Phase 3 of Training: Reinforcement Learning

### Inspired by AlphaGo

AlphaGo, which defeated the strongest human Go player Lee Sedol in 2016, demonstrated in [its paper](https://discovery.ucl.ac.uk/id/eprint/10045895/1/agz_unformatted_nature.pdf) that if a model learns by imitating humans, then its capability ceiling is limited to that of humans (purple line in the diagram below). However, if we use *reinforcement learning (RL)*, setting a goal (winning the game) and allowing the model to explore and experiment on its own, then the model has the potential to break through human limitations and achieve superhuman abilities (blue line in the diagram below). [Move 37](https://www.youtube.com/watch?v=HT-UZkiOLv8) in that match was an example of this.

![](https://substackcdn.com/image/fetch/$s_!f0xh!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1b689f32-189f-4524-b302-f526351741be_1352x1140.png)

AlphaGo: Human Imitation vs Reinforcement Learning

The SFT Model obtained in the second stage of LLM training is an example of human imitation. We can train the SFT Model with data from experts in various fields, but its upper limit may struggle to surpass the best experts in each field.

In this phase, we aim to train an RL Model based on the SFT Model using reinforcement learning.

### Reinforcement Learning: Providing Goals and Giving Feedback

When training an LLM using reinforcement learning, we do not directly provide final answers to the LLM. Instead, we provide a *goal* and allow the LLM to continuously learn through *trial and error*. If the result of each attempt reaches the goal, positive feedback is given; otherwise, negative feedback is provided.

Take mathematics as an example. If we want the LLM to learn *"how to solve math problems"* by itself, it will attempt various methods. The solution might involve “listing out equations step by step for gradual computation”, “solving the problem in a single line of calculation”, or even “skipping the equation and directly outputting the answer”.

![](https://substackcdn.com/image/fetch/$s_!QT4n!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd4cca5d-7503-453d-94fb-0f6e8e22bb09_693x639.png)

Various approaches to the same math problem

Our training objective can be set as *"the answer obtained by the solution is correct."* For each solution generated by the LLM, we compare its answer with the actual correct answer. If they match, the LLM receives positive feedback (green line in the diagram); otherwise, it receives negative feedback (red line in the diagram). This feedback is then used to update the model's weights. By repeatedly going through this process and covering various types of math problems, the LLM may learn to solve math problems without imitating others (and might even surpass human performance).

![](https://substackcdn.com/image/fetch/$s_!aDEh!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F856f389b-ae42-4b47-93b6-af915160ff96_999x789.png)

Trying different solutions and providing positive or negative Feedback based on the correctness of the answer

### Reasoning Models: DeepSeek-R1, GPT o\* Series, Gemini 2.0 Flash Thinking

Apart from mathematical problems, there are other problems that require complex thinking processes before arriving at an answer, such as programming, logic problems, and physics problems. These abilities can also be enhanced through reinforcement learning. Karpathy refers to LLMs with an additional explicit reasoning phase as *Reasoning Models* or *Thinking Models*. Early representatives of such LLMs include [DeepSeek-R1](https://arxiv.org/abs/2501.12948), the [GPT o\* series](https://platform.openai.com/docs/guides/reasoning) (GPT-o1, GPT-o3), and [Gemini 2.0 Flash Thinking](https://deepmind.google/technologies/gemini/flash-thinking/).

> The image below is from the [official DeepSeek website](https://chat.deepseek.com/). If there are privacy concerns, you can try other model inference providers, such as [TogetherAI](https://api.together.xyz/).

![](https://substackcdn.com/image/fetch/$s_!_OAF!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F769aeff6-551e-4f9c-b5cf-0a5428f29b33_1097x959.png)

Testing of DeepSeek-R1's reasoning process

DeepSeek-R1 is the first reasoning model with publicly available detailed training methods and [weights](https://github.com/deepseek-ai/DeepSeek-R1). From its research paper, some interesting observations can be made:

- As training progresses, the average number of tokens generated during reasoning increases, indicating that the model itself has discovered that longer and more detailed reasoning processes help achieve correct answers.
- Sentences with an anthropomorphic tone appear, such as ["Aha! Moment"](https://en.wikipedia.org/wiki/Eureka_effect) during the reasoning process.

![](https://substackcdn.com/image/fetch/$s_!BCyZ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6e4866f0-5e00-4a23-9b8b-d514421fbe13_1770x1020.png)

Increase in the average token count generated during DeepSeek-R1’s reasoning process

![](https://substackcdn.com/image/fetch/$s_!Vz7s!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe74648de-e8d4-44a6-b9c2-634f9554b6f9_1727x990.png)

"Aha! Moment" in DeepSeek-R1

> You can learn about DeepSeek [here](https://www.techtarget.com/whatis/feature/DeepSeek-explained-Everything-you-need-to-know) and DeepSeek-R1 [here](https://medium.com/@tahirbalarabe2/deepseek-r1-explained-chain-of-thought-reinforcement-learning-and-model-distillation-0eb165d928c9).

Models like GPT-4o also possess a certain level of reasoning capability, but they do not have an explicitly separate reasoning phase and have not undergone the reinforcement learning training mentioned above. Instead, they rely on *RLHF*, which will be discussed next. Karpathy argues that RLHF is essentially a form of fine-tuning rather than reinforcement learning, making the overall behavior more similar to a second-stage SFT Model (which imitates humans).

### RLHF: When There Is No Standard Answer, Use Human Feedback

The reinforcement learning method mentioned above has a limitation: many types of problems do not have a standard answer. Examples include business strategy, literary creation, and philosophical reasoning, where it is impossible to definitively determine whether the solution provided by an LLM is right or wrong. In such cases, we rely on human feedback.

For instance, if we want to train an LLM to *"tell funny jokes"*, the training process involves repeated steps: the LLM generates a joke, a human evaluates it, provides positive feedback if it is funny, and negative feedback if it is not, thereby updating the LLM’s model weights. However, this approach presents challenges in terms of labor costs (requiring a large number of human evaluators) and time costs (humans must be involved in the training process and cannot pre-evaluate a batch of jokes produced by the LLM). Therefore, this method is almost impractical in real-world applications.

![](https://substackcdn.com/image/fetch/$s_!fvLt!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d88536e-5c85-45f3-b082-cc687c9d7759_1076x845.png)

Human evaluation faces challenges in scalability

To reduce human involvement and costs, we introduce an additional step: training a *reward model* that simulates human preferences. Using jokes as an example, the reward model takes a joke as input and outputs a score (e.g., a number between 0 and 1), where a higher score indicates that humans find the joke funnier.

The training data for the reward model is collected and labeled by having an LLM generate multiple jokes in batches. Human annotators rank the jokes within each batch, and these rankings are then converted into numerical scores, serving as ground truth for training the reward model.

Once the reward model is trained, we proceed with reinforcement learning for the LLM, but instead of humans, the reward model provides the feedback.

This entire approach is known as *RLHF (reinforcement learning from human feedback)*.

![](https://substackcdn.com/image/fetch/$s_!dZ2u!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9131bc15-f867-4d85-ab28-0da760255102_1193x654.png)

RLHF overcomes the scalability challenge

A clear advantage of RLHF is its applicability to any domain. It introduces a *discrimination* mechanism to guide *generation*, similar to the concept of [GANs](https://arxiv.org/abs/1406.2661). However, RLHF has its drawbacks: it relies entirely on the reward model.

For example, in the early stages of RL training, the reward model can correctly rate jokes generated by the LLM. But in later stages, as the LLM's joke-telling ability surpasses the reward model's evaluation capability, further training may become ineffective or even degrade the LLM's performance. In a worse scenario, the LLM might "game" the reward model, finding ways to generate high-scoring but nonsensical jokes. Because of this limitation, RLHF is not suitable for long-term training. This is why Karpathy argues that RLHF is not true reinforcement learning but rather a form of fine-tuning.

![](https://substackcdn.com/image/fetch/$s_!p_ox!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc7fd04d3-e989-4073-9b3d-768c76934f38_1193x654.png)

Pros and cons of RLHF

> For a deeper understanding of RLHF, check out [this article](https://cameronrwolfe.substack.com/p/basics-of-reinforcement-learning).

## Conclusion

### Future Trends of LLMs

- *[Multimodal](https://magazine.sebastianraschka.com/p/understanding-multimodal-llms)*: Currently, advanced LLMs already have basic multimodal capabilities. In the future, the types of data LLMs can process will continue to expand—not only handling text but also processing images, audio, video, etc. These data types will be converted into tokens, allowing LLMs to operate in the same way as with text. For example, an audio token can be a *spectrogram* slice of the audio signal.
- From Tasks to *[Agents](https://www.promptingguide.ai/research/llm-agents)*: Agents has been a highly popular topic recently. LLM agents are not just capable of completing isolated, short-term tasks; they can even handle complex, long-term problems. They may need to possess abilities such as self-planning, self-correction, reasoning, memory, and tool usage.
- *Computer-Using Agent*: AI has the capability to operate in the digital world like humans, using computers and applications through GUI (or other interfaces). OpenAI’s [Operator](https://openai.com/index/computer-using-agent/) is an early example of this.
- *[Test-Time Training (TTT)](https://medium.com/thedeephub/test-time-training-ttt-a-new-approach-to-sequence-modeling-8baf1ea79ed7)*: Unlike In-Context Learning, TTT allows LLMs to learn (by updating model weights) in real-time during the inference stage, providing a potential method for quickly adapting to new domain-specific problems. Currently, no well-known LLM has this capability.

### Keep Tracking the Latest LLMs

- [Chatbot Arena](https://lmarena.ai/): Visit the website and select `Leaderboard` to see the latest ranking of LLMs.
- Subscribe to [AI News](https://buttondown.com/ainews): Stay updated with the latest AI information.
- Follow X (Twitter) Accounts: Many AI and tech industry professionals frequently post updates there, such as [Sam Altman](https://x.com/sama).

### Exploring Various LLMs

- Closed-Source Models: Examples include ChatGPT and Gemini, which can only be accessed through their official websites or apps.
- Open-Source or Open-Weight Models: Examples include DeepSeek and Llama. If you lack technical expertise or computational resources, you can use providers like [TogetherAI](https://api.together.xyz/), or you can deploy them yourself using tools like [LM Studio](https://lmstudio.ai/).

### A Summary Image of All Key Points

Karpathy’s explanation is essentially based on the following self-made diagram. You can click [here](https://drive.google.com/file/d/1ip_S0UYujTUXBrVQnPj5-5_SUbcbf8rT/view) to download the image or upload [the file](https://drive.google.com/file/d/1EZh5hNDzxMMy05uLhVryk061QYQGTxiN/view) to [Excalidraw](https://excalidraw.com/) for a detailed view.

![](https://substackcdn.com/image/fetch/$s_!WeaX!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3e5f9313-cfd3-4d9b-994f-80289dcf70a6_4136x9861.png)