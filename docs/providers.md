# Providers & Models

This page covers where to get API keys and which models work well.

## Provider overview

Providers are configured in one of two ways:
1. **Globally** in `config.yaml` via the `providers[]` list (used by all guilds).
2. **Per-guild** via the `/setup ai provider` slash command (overrides the global config for that server).

Providers are tried **in order** — if the first fails, the next is attempted. If all fail, the thread is locked and a static fallback message is returned.

| Provider | Config `name` | SDK | Free tier |
|----------|-------------|-----|-----------|
| OpenAI | `openai` | `@ai-sdk/openai` | ❌ |
| OpenRouter | `openrouter` | `@ai-sdk/openai` (custom base URL) | ✅ |
| HuggingFace | `huggingface` | `@ai-sdk/openai` (custom base URL) | ✅ |
| Anthropic / Claude | `anthropic` | `@ai-sdk/anthropic` | ❌ |
| Google / Gemini | `gemini` | `@ai-sdk/google` | ✅ |
| Any OpenAI-compatible | `*` | `@ai-sdk/openai` (custom base URL) | varies |

## Getting keys

### OpenRouter
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys).
2. Sign in (no credit card required for free tier).
3. Click **Create Key**, copy the token.

### HuggingFace
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
2. Click **New token** → Role: **Read**.
3. Copy the token.

### Gemini (Google)
1. Go to [aistudio.google.com](https://aistudio.google.com).
2. Click **Get API key** in the sidebar.

### ChatGPT (OpenAI)
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Create a secret key and add billing.

### Claude (Anthropic)
1. Go to [console.anthropic.com](https://console.anthropic.com).
2. Create an API key and add billing.

## Config example

### Global config (config.yaml)

```yaml
providers:
  - name: openrouter
    model: "google/gemini-2.5-flash"
    token: "sk-or-v1-..."
    base_url: "https://openrouter.ai/api/v1"
  - name: openai
    model: "gpt-4o-mini"
    token: "sk-proj-..."
  - name: huggingface
    model: "Qwen/Qwen2.5-7B-Instruct"
    token: "hf_..."
    base_url: "https://api-inference.huggingface.co/v1"
```

### Per-guild override (/setup slash command)

```
/setup ai provider type:openrouter key:sk-or-v1-... model:google/gemini-2.5-flash
```

## Provider-specific notes

- **OpenRouter**: Many free models available. Set `base_url` to `https://openrouter.ai/api/v1`.
- **HuggingFace**: Free Inference API is rate-limited. Set `base_url` to `https://api-inference.huggingface.co/v1`.
- **Ollama / LM Studio**: Set `base_url` to the local address (e.g., `http://host.docker.internal:11434/v1`). Token can be empty.

## Quick decision guide

| You want… | Use this |
|-----------|----------|
| Nothing to pay | OpenRouter (`openrouter`) |
| Fastest free | HuggingFace (`huggingface`) |
| Best quality (paid) | Claude (`anthropic`) |
| Cheapest paid | OpenAI (`openai`, `gpt-4o-mini`) |
| Fully private | Ollama (`ollama`) |
