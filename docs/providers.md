# Providers & Models

This page covers where to get API keys for each provider and which models work well, whether you want to pay nothing or get the best results.

---

## Provider overview

| Provider    | Free tier                  | Min. cost | Key location |
|-------------|----------------------------|-----------|--------------|
| OpenRouter  | ✅ Yes (28+ free models)   | $0        | [openrouter.ai/keys](https://openrouter.ai/keys) |
| HuggingFace | ✅ Yes (rate-limited)      | $0        | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| Gemini      | ✅ Yes (Flash models only) | $0        | [aistudio.google.com](https://aistudio.google.com) |
| Groq        | ✅ Yes (rate-limited)      | $0        | [console.groq.com/keys](https://console.groq.com/keys) |
| ChatGPT     | ❌ No                      | $0.15/M   | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Claude      | ❌ No                      | $0.80/M   | [console.anthropic.com](https://console.anthropic.com) |
| DeepSeek    | ❌ No                      | $0.14/M   | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) |
| Mistral     | ❌ No                      | $0.25/M   | [console.console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| Together    | ❌ No                      | $0.10/M   | [api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys) |
| Perplexity  | ❌ No                      | $1/M      | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) |
| Fireworks   | ❌ No                      | $0.20/M   | [fireworks.ai/api-keys](https://fireworks.ai/api-keys) |
| DeepInfra   | ❌ No                      | $0.15/M   | [deepinfra.com/dash/api_keys](https://deepinfra.com/dash/api_keys) |
| Grok (xAI)  | ❌ No                      | $2/M      | [console.x.ai](https://console.x.ai) |
| Ollama      | ✅ Local, fully free       | $0        | No key needed — runs on your machine |
| LM Studio   | ✅ Local, fully free       | $0        | No key needed — runs on your machine |

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

Any model with the **Inference Available** badge on its model page works on the free tier.

| Model | Best for | Params |
|-------|----------|--------|
| `Qwen/Qwen2.5-7B-Instruct` | **Recommended.** Fast, capable German/English chat. | 7B |
| `Qwen/Qwen2.5-Coder-7B-Instruct` | **Coding.** Specialized for code generation. | 7B |
| `mistralai/Mistral-7B-Instruct-v0.3` | Strong all-rounder with good speed. | 7B |
| `meta-llama/Llama-3.1-8B-Instruct` | Reliable, widely tested. | 8B |
| `microsoft/Phi-3-medium-4k-instruct` | Good quality per parameter. | 14B |

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

Free tier: ~1,500 requests/day, 10 RPM. No credit card required.

| Model | Best for | Context |
|-------|----------|---------|
| `gemini-3.5-flash` | **Recommended.** Latest Flash — Pro-level intelligence at Flash speed. | 1M |
| `gemini-3.1-flash-lite` | **Cheapest.** Cost-efficient workhorse for high-volume tasks. | 1M |
| `gemini-2.5-flash` | Prior-gen, still solid. | 1M |

### Paid models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `gemini-3.5-flash` | $1.50 | $9.00 | Paid tier excludes content training |
| `gemini-3.1-pro-preview` | $2 | $12 | Stronger reasoning |

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
3. Set it as `provider.chatgpt.token` in `config.yaml`.
4. Add billing at [platform.openai.com/account/billing](https://platform.openai.com/account/billing).

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `gpt-4o-mini` | $0.15 | $0.60 | **Cheapest.** Fast, good for simple tasks. |
| `gpt-4o` | $2.50 | $10 | **Recommended.** Best balance of speed + quality. |
| `o3-mini` | $1.10 | $4.40 | Strong reasoning, slower. |
| `o1` | $15 | $60 | Max reasoning, use only for hard problems. |

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
3. Set it as `provider.claude.token` in `config.yaml`.
4. Add billing in the console.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `claude-3-5-haiku-20241022` | $0.80 | $4 | **Cheapest.** Fast, good for simple tasks. |
| `claude-sonnet-4-20250514` | $3 | $15 | **Recommended.** Best quality-to-price ratio. |
| `claude-opus-4-20250514` | $15 | $75 | Best reasoning, use only for complex tasks. |

```yaml
provider:
  name: claude
  max_tokens: 500
  claude:
    model: "claude-sonnet-4-20250514"
    token: "YOUR_CLAUDE_TOKEN"
```

---

## DeepSeek

Fast, cheap reasoning models. OpenAI-compatible API.

### Getting a key

1. Go to [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys).
2. Sign in and create an API key.
3. Set it as `provider.deepseek.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `deepseek-chat` | $0.14 | $0.28 | **Recommended.** Latest V3 model, strong all-rounder. |
| `deepseek-reasoner` | $0.55 | $2.19 | Chain-of-thought reasoning, best for math/logic. |

```yaml
provider:
  name: deepseek
  max_tokens: 500
  deepseek:
    model: "deepseek-chat"
    token: "YOUR_DEEPSEEK_TOKEN"
```

---

## Mistral

European-hosted models, strong multilingual performance. OpenAI-compatible API.

### Getting a key

1. Go to [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys).
2. Sign in and create an API key.
3. Set it as `provider.mistral.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `mistral-small-latest` | $0.25 | $0.75 | **Cheapest.** Fast, good for simple tasks. |
| `mistral-large-latest` | $2 | $6 | **Recommended.** Strong multilingual, 128K context. |
| `mistral-moderation-latest` | $0.10 | $0.10 | Content moderation, not for chat. |

```yaml
provider:
  name: mistral
  max_tokens: 500
  mistral:
    model: "mistral-large-latest"
    token: "YOUR_MISTRAL_TOKEN"
```

---

## Groq

Groq provides extremely fast inference on open-weight models. Has a free tier with rate limits. OpenAI-compatible API.

### Getting a key

1. Go to [console.groq.com/keys](https://console.groq.com/keys).
2. Sign in (Google or GitHub — no credit card required).
3. Click **Create API Key**, give it a name, copy the token.
4. Set it as `provider.groq.token` in `config.yaml`.

> **Note:** `groq` (inference provider) and `grok` (xAI model) are different. Groq gives you fast access to Llama, Mixtral, Gemma and other open models.

### Free models

Free tier: ~30 requests/min, ~14,400 requests/day. No credit card needed.

| Model | Best for |
|-------|----------|
| `llama-3.3-70b-versatile` | **Recommended.** Fast, strong all-rounder with tool use. |
| `llama-3.1-8b-instant` | **Fastest.** Nearly instant responses, good for simple tasks. |
| `mixtral-8x7b-32768` | Strong multilingual, 32K context. |

### Paid models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `llama-3.3-70b-versatile` | $0.59 | $0.79 | Same model, paid tier = higher rate limits |
| `llama-guard-3-8b` | $0.20 | $0.20 | Safety classification |

```yaml
provider:
  name: groq
  max_tokens: 500
  groq:
    model: "llama-3.3-70b-versatile"
    token: "YOUR_GROQ_TOKEN"
```

---

## Together AI

Hosts hundreds of open-source models. Good for running community models that aren't available elsewhere. OpenAI-compatible API.

### Getting a key

1. Go to [api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys).
2. Sign in and create an API key.
3. Set it as `provider.together.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo` | $0.10 | $0.10 | **Cheapest.** Fast, reliable. |
| `mistralai/Mixtral-8x22B-Instruct-v0.1` | $0.90 | $0.90 | Strong multilingual. |
| `Qwen/Qwen2.5-72B-Instruct-Turbo` | $0.90 | $0.90 | **Recommended.** Best quality on Together. |

```yaml
provider:
  name: together
  max_tokens: 500
  together:
    model: "Qwen/Qwen2.5-72B-Instruct-Turbo"
    token: "YOUR_TOGETHER_TOKEN"
```

---

## Perplexity

Good for research-oriented queries with citation support. OpenAI-compatible API.

### Getting a key

1. Go to [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api).
2. Sign in and generate an API key.
3. Set it as `provider.perplexity.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `sonar-pro` | $1 | $1 | **Recommended.** Balanced quality and speed. |
| `sonar-reasoning-pro` | $2 | $8 | Strong reasoning with chain-of-thought. |
| `sonar-deep-research` | $3 | $12 | Deep research, slower but thorough. |

```yaml
provider:
  name: perplexity
  max_tokens: 500
  perplexity:
    model: "sonar-pro"
    token: "YOUR_PERPLEXITY_TOKEN"
```

---

## Fireworks AI

Fast inference optimized for production workloads. OpenAI-compatible API.

### Getting a key

1. Go to [fireworks.ai/api-keys](https://fireworks.ai/api-keys).
2. Sign in and create an API key.
3. Set it as `provider.fireworks.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `accounts/fireworks/models/llama-v3p1-8b-instruct` | $0.20 | $0.20 | **Cheapest.** Fast responses. |
| `accounts/fireworks/models/llama-v3p3-70b-instruct` | $0.90 | $0.90 | **Recommended.** Best quality. |
| `accounts/fireworks/models/mixtral-8x22b-instruct` | $1.20 | $1.20 | Strong multilingual. |

```yaml
provider:
  name: fireworks
  max_tokens: 500
  fireworks:
    model: "accounts/fireworks/models/llama-v3p3-70b-instruct"
    token: "YOUR_FIREWORKS_TOKEN"
```

---

## DeepInfra

Serverless inference with competitive pricing. OpenAI-compatible API.

### Getting a key

1. Go to [deepinfra.com/dash/api_keys](https://deepinfra.com/dash/api_keys).
2. Sign in and create an API key.
3. Set it as `provider.deepinfra.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `meta-llama/Meta-Llama-3.1-8B-Instruct` | $0.06 | $0.06 | **Cheapest.** Very fast. |
| `meta-llama/Meta-Llama-3.1-70B-Instruct` | $0.35 | $0.40 | **Recommended.** Best quality-to-price. |
| `Qwen/Qwen2.5-72B-Instruct` | $0.35 | $0.40 | Strong for German/English bilingual. |

```yaml
provider:
  name: deepinfra
  max_tokens: 500
  deepinfra:
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct"
    token: "YOUR_DEEPINFRA_TOKEN"
```

---

## Grok (xAI)

Paid tier. Fast responses, moderate pricing. Not to be confused with Groq.

### Getting a key

1. Go to [console.x.ai](https://console.x.ai).
2. Sign in and create an API key.
3. Set it as `provider.grok.token` in `config.yaml`.

### Models

| Model | Input / 1M | Output / 1M | Notes |
|-------|-----------|------------|-------|
| `grok-3-beta` | $2 | $8 | **Recommended.** Latest, fastest, best quality. |
| `grok-2-1212` | $1 | $4 | Prior-gen, still capable. |

```yaml
provider:
  name: grok
  max_tokens: 500
  grok:
    model: "grok-3-beta"
    token: "YOUR_GROK_TOKEN"
```

---

## Ollama (local)

Run models entirely on your own machine with Ollama. Zero cost, fully private, no internet required. Serves an OpenAI-compatible API at `http://localhost:11434/v1`.

### Setup

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2

# The API is now available at http://localhost:11434/v1
```

### Models

| Model | Params | Notes |
|-------|--------|-------|
| `llama3.2` | 3B | **Fastest.** Runs on any machine, great for simple chat. |
| `llama3.1` | 8B | **Recommended.** Strong quality, needs ~8GB RAM. |
| `qwen2.5` | 7B | Good for German/English bilingual tasks. |
| `mistral` | 7B | Solid all-rounder. |
| `phi4` | 14B | Strong quality-to-size ratio, needs ~16GB RAM. |

```yaml
provider:
  name: ollama
  max_tokens: 500
  ollama:
    model: "llama3.1"
    token: ""
```

> **Important:** The bot must be able to reach `http://host.docker.internal:11434` if running in Docker, or `http://localhost:11434` if running locally. In Dokploy/Coolify, use the host network or a custom network.

---

## LM Studio (local)

Run models locally through LM Studio's built-in OpenAI-compatible server at `http://localhost:1234/v1`.

### Setup

1. Download LM Studio from [lmstudio.ai](https://lmstudio.ai).
2. Load a model (e.g., `qwen2.5-7b-instruct`).
3. Start the local inference server (click **Start Server**).
4. The API is now available at `http://localhost:1234/v1`.

### Models

Any model you download in LM Studio works. Recommended for this bot:

| Model | Notes |
|-------|-------|
| `qwen2.5-7b-instruct` | **Recommended.** Strong German/English support. |
| `llama-3.2-3b-instruct` | **Fastest.** Runs on any machine. |
| `mistral-7b-instruct` | Solid all-rounder. |

```yaml
provider:
  name: lmstudio
  max_tokens: 500
  lmstudio:
    model: "qwen2.5-7b-instruct"
    token: ""
```

> **Important:** Same networking caveat as Ollama — the bot needs to reach `http://host.docker.internal:1234` from inside a container.

---

## Quick decision guide

| You want… | Use this |
|-----------|----------|
| Nothing to pay | OpenRouter (`openrouter/owl-alpha`) |
| Free + fastest responses | Groq (`llama-3.3-70b-versatile`) |
| Free + good German support | HuggingFace (`Qwen/Qwen2.5-7B-Instruct`) |
| Best reasoning (free) | OpenRouter (`deepseek/deepseek-r1:free`) |
| Cheapest paid option | DeepSeek (`deepseek-chat`) |
| Best quality (paying) | Claude (`claude-sonnet-4-20250514`) |
| Best multimodal (paying) | Gemini (`gemini-3.5-flash` paid tier) |
| Best coding (free) | OpenRouter (`qwen/qwen3-coder:free`) |
| Best coding (paid) | ChatGPT (`gpt-4o`) or Claude (`claude-sonnet-4`) |
| Fully private / no API key | Ollama or LM Studio (local) |
