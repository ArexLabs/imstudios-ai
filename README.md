# Discord LLM Bot

A Discord bot that responds to messages in a specific channel using your choice of LLM provider.

## Supported providers

| Provider     | config name     | API docs                                |
|-------------|----------------|------------------------------------------|
| HuggingFace | `huggingface`  | [huggingface.co](https://huggingface.co) |
| OpenRouter  | `openrouter`   | [openrouter.ai](https://openrouter.ai)   |
| Gemini      | `gemini`       | [aistudio.google.com](https://aistudio.google.com) |
| Claude      | `claude`       | [anthropic.com](https://anthropic.com)   |
| Grok        | `grok`         | [x.ai](https://x.ai)                     |
| ChatGPT     | `chatgpt`      | [platform.openai.com](https://platform.openai.com) |

## Requirements

- Python 3.11+
- [UV](https://docs.astral.sh/uv/) (package manager)

## Setup

```bash
# 1. Install dependencies
uv sync

# 2. Create your config from the template
cp config.example.yaml config.yaml

# 3. Edit config.yaml — fill in your tokens, channel ID, and pick a provider
```

### Example `config.yaml`

```yaml
discord:
  token: "MTE4Nz...your_discord_bot_token"
  target_channel_id: 123456789012345678

provider:
  name: huggingface  # <- switch provider here
  max_tokens: 500
  system_prompt: "Du bist ein hilfreicher Discord-Assistent."

  huggingface:
    model: "Qwen/Qwen2.5-7B-Instruct"
    token: "hf_your_huggingface_token"
```

**Only edit `config.yaml`** — it's in `.gitignore` so your tokens stay safe. The file `config.example.yaml` is the committed template.

## Usage

```bash
uv run bot
```

The bot listens to messages in the channel you set in `target_channel_id` and replies using the selected provider.

## Deploy on Discloud

1. Push the repo (without `config.yaml` — use `config.example.yaml` as reference)
2. On Discloud, create `config.yaml` with your real tokens
3. `discloud.config` is already set up — entry point is `src/bot/__main__.py`

## Project structure

```
├── config.example.yaml      # Template (safe to commit)
├── config.yaml              # Your config (gitignored)
├── discloud.config          # Discloud deploy config
├── pyproject.toml           # Project & dependency config
├── src/
│   └── bot/
│       ├── __main__.py      # Entry point
│       ├── config.py        # Config loader & validation
│       ├── main.py          # Discord bot logic
│       └── providers/       # LLM provider implementations
│           ├── huggingface.py
│           ├── openai_compat.py   # ChatGPT, OpenRouter, Grok
│           ├── anthropic.py       # Claude
│           └── google.py          # Gemini
└── .gitignore
```
