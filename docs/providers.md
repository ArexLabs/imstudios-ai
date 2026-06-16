# Providers & Models

This page covers where to get API keys for each provider and which models work well, whether you want to pay nothing or get the best results.

---

## Provider overview

| Provider    | Free tier                  | Min. cost | Key location |
|-------------|----------------------------|-----------|--------------|
| OpenRouter  | ✅ Yes (28+ free models)   | $0        | [openrouter.ai/keys](https://openrouter.ai/keys) |
| HuggingFace | ✅ Yes (rate-limited)      | $0        | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| Gemini      | ✅ Yes (Flash models only) | $0        | [aistudio.google.com](https://aistudio.google.com) |
| ChatGPT     | ❌ No | $0.15/M tokens      |           | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Claude      | ❌ No | $0.80/M tokens      |           | [console.anthropic.com](https://console.anthropic.com) |
| Grok        | ❌ No | ~$2/M tokens        |           | [console.x.ai](https://console.x.ai) |

---

## OpenRouter

OpenRouter aggregates dozens of LLM providers behind a single API. You get access to free and paid models without wiring separate keys.

### Getting a key

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys).
2. Sign in (GitHub or Google — no credit card required).
3. Click **Create Key**, give it a name, copy the token.
4. Set it as `provider.openrouter.token` in `config.yaml`.

### Free models (June 2026)

Rate limits: ~20 requests/min, ~200 requests/day. No credit card needed.

| Model | Best for | Context |
|-------|----------|---------|
| `openrouter/owl-alpha` | **Best all-round.** 1M context, strong reasoning, coding, agentic tasks. | 1M |
| `qwen/qwen3-coder:free` | **Best for coding.** Coding specialist with 262K context. | 262K |
| `deepseek/deepseek-r1:free` | **Best reasoning.** Math, logic, complex chain-of-thought. | 128K |
| `nvidia/nemotron-3-ultra-550b-a55b:free` | **Strong generalist.** 1M context, open-weight flagship. | 1M |
| `meta-llama/llama-3.3-70b-instruct:free` | **Solid all-purpose.** Well-supported, reliable. | 128K |
| `google/gemma-4-31b-it:free` | **Vision + text.** Multimodal tasks. | varies |
| `openrouter/free` | **Auto-router.** Routes every request to best available free model. | varies |

Set your config to:

```yaml
provider:
  name: openrouter
  max_tokens: 500
  openrouter:
    model: "openrouter/owl-alpha"
    token: "YOUR_OPENROUTER_TOKEN"
```

### Paid models

Load your account with a few dollars. Prices are per million tokens.

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `mistralai/mistral-large-2411` | $2 | $6 | Strong EU-hosted generalist |
| `openai/gpt-4o` | $2.50 | $10 | Fast, widely compatible |
| `anthropic/claude-3.5-sonnet` | $3 | $15 | Best for nuanced instruction following |
| `google/gemini-2.5-flash` | $0.15 | $0.60 | Cheap workhorse |

---

## HuggingFace

HuggingFace offers a free serverless Inference API (rate-limited, no fixed published limits) and paid Inference Endpoints for production.

### Getting a key

1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
2. Click **New token** → give it a name → role: **Read**.
3. Copy the token and set it as `provider.huggingface.token` in `config.yaml`.

### Free models

Any model with the **Inference Available** badge on its model page works on the free tier. Rate limits vary by model popularity.

| Model | Best for | Params |
|-------|----------|--------|
| `Qwen/Qwen2.5-7B-Instruct` | **Recommended.** Fast, capable German/English chat. | 7B |
| `Qwen/Qwen2.5-Coder-7B-Instruct` | **Coding.** Specialized for code generation. | 7B |
| `mistralai/Mistral-7B-Instruct-v0.3` | Strong all-rounder with good speed. | 7B |
| `meta-llama/Llama-3.1-8B-Instruct` | Reliable, widely tested. | 8B |
| `microsoft/Phi-3-medium-4k-instruct` | Good quality per parameter. | 14B |
| `HuggingFaceH4/zephyr-7b-beta` | Lightweight, fast responses. | 7B |

Set your config to:

```yaml
provider:
  name: huggingface
  max_tokens: 500
  huggingface:
    model: "Qwen/Qwen2.5-7B-Instruct"
    token: "YOUR_HF_TOKEN"
```

### Production (Inference Endpoints)

When the free tier rate limits aren't enough, deploy a dedicated Inference Endpoint:

- **CPU:** $0.03/hr — classifiers, embeddings, small models.
- **T4 / L4:** $0.40–$0.80/hr — 7–13B chat models.
- **A10G / L40S:** $1.00–$1.80/hr — 13–30B models.
- **A100 / H100:** $1.29–$10.00/hr — 70B+ models.

---

## Gemini (Google)

Gemini has a generous free tier that covers Flash models. No credit card needed.

### Getting a key

1. Go to [aistudio.google.com](https://aistudio.google.com).
2. Sign in with any Google account.
3. Click **Get API key** in the left sidebar.
4. Copy the key and set it as `provider.gemini.token` in `config.yaml`.

### Free models

Free tier: ~1,500 requests/day, 10 RPM. No credit card required. Content may be used to improve Google's products — don't send sensitive data.

| Model | Best for | Context |
|-------|----------|---------|
| `gemini-3.5-flash` | **Recommended.** Latest Flash — Pro-level intelligence at Flash speed. | 1M |
| `gemini-3.1-flash-lite` | **Cheapest.** Cost-efficient workhorse for high-volume tasks. | 1M |
| `gemini-2.5-flash` | Prior-gen, still solid. | 1M |

### Paid models

Link a billing account to access Pro models and higher rate limits.

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `gemini-3.5-flash` | $1.50 | $9.00 | Same model, paid tier has no content training |
| `gemini-3.1-pro-preview` | $2 | $12 | Stronger reasoning, best for complex tasks |

Set your config to:

```yaml
provider:
  name: gemini
  max_tokens: 500
  gemini:
    model: "gemini-3.5-flash"
    token: "YOUR_GEMINI_TOKEN"
```

---

## ChatGPT (OpenAI)

No free API tier. Pay-as-you-go.

### Getting a key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Sign in and click **Create new secret key**.
3. Copy the key and set it as `provider.chatgpt.token` in `config.yaml`.
4. Add billing at [platform.openai.com/account/billing](https://platform.openai.com/account/billing).

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `gpt-4o-mini` | $0.15 | $0.60 | **Cheapest.** Fast, good for simple tasks. |
| `gpt-4o` | $2.50 | $10 | **Recommended.** Best balance of speed + quality. |
| `o3-mini` | $1.10 | $4.40 | Strong reasoning, slower. |
| `o1` | $15 | $60 | Max reasoning, use only for hard problems. |

Set your config to:

```yaml
provider:
  name: chatgpt
  max_tokens: 500
  chatgpt:
    model: "gpt-4o-mini"
    token: "YOUR_OPENAI_TOKEN"
```

---

## Claude (Anthropic)

No free API tier. Known for strong instruction following and long-context tasks.

### Getting a key

1. Go to [console.anthropic.com](https://console.anthropic.com).
2. Sign in and click **Create API key**.
3. Copy the key and set it as `provider.claude.token` in `config.yaml`.
4. Add billing in the console.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `claude-3-5-haiku-20241022` | $0.80 | $4 | **Cheapest.** Fast, good for simple tasks. |
| `claude-sonnet-4-20250514` | $3 | $15 | **Recommended.** Best quality-to-price ratio. |
| `claude-opus-4-20250514` | $15 | $75 | Best reasoning, use only for complex tasks. |

Set your config to:

```yaml
provider:
  name: claude
  max_tokens: 500
  claude:
    model: "claude-sonnet-4-20250514"
    token: "YOUR_CLAUDE_TOKEN"
```

---

## Grok (xAI)

Paid tier. Fast responses, moderate pricing.

### Getting a key

1. Go to [console.x.ai](https://console.x.ai).
2. Sign in and create an API key.
3. Copy the key and set it as `provider.grok.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `grok-3-beta` | $2 | $8 | **Recommended.** Latest, fastest, best quality. |
| `grok-2-1212` | $1 | $4 | Prior-gen, still capable. |

Set your config to:

```yaml
provider:
  name: grok
  max_tokens: 500
  grok:
    model: "grok-3-beta"
    token: "YOUR_GROK_TOKEN"
```

---

## Quick decision guide

| You want… | Use this |
|-----------|----------|
| Nothing to pay | OpenRouter (`openrouter/owl-alpha`) |
| Free + good German support | HuggingFace (`Qwen/Qwen2.5-7B-Instruct`) |
| Cheapest paid option | ChatGPT (`gpt-4o-mini`) |
| Best quality (paying) | Claude (`claude-sonnet-4-20250514`) |
| Best multimodal (paying) | Gemini (`gemini-3.5-flash` paid tier) |
| Best reasoning | OpenRouter (`deepseek/deepseek-r1:free`) or OpenAI (`o3-mini`) |
| Best coding (free) | OpenRouter (`qwen/qwen3-coder:free`) |
| Best coding (paid) | ChatGPT (`gpt-4o`) or Claude (`claude-sonnet-4`) |
