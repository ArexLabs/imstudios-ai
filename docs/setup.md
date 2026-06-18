# Setup Commands

The bot registers a `/setup` slash command globally on startup. These commands let you configure the bot per-guild without editing `config.yaml`.

## Available commands

### `/setup logs <channel>`

Forward all bot log output (info, warnings, errors) to a specific Discord channel.

**Example:**
```
/setup logs #bot-logs
```

After running this, the bot's console logs will appear in the specified channel, wrapped in code blocks. Logs are batched and flushed every 2 seconds.

### `/setup ai provider <type> <key> [model] [base_url]`

Override the AI provider for this server. When set, this provider is used instead of the global `providers[]` list from `config.yaml`.

| Option | Required | Description |
|--------|----------|-------------|
| `type` | ✅ | Provider name: `openrouter`, `openai`, `anthropic`, `gemini`, `huggingface`, or any OpenAI-compatible slug |
| `key` | ✅ | API key for the provider |
| `model` | ❌ | Model name (e.g., `google/gemini-2.5-flash`). Falls back to the first global provider's model if omitted |
| `base_url` | ❌ | Custom base URL for the provider API |

**Examples:**
```
/setup ai provider type:openrouter key:sk-or-v1-... model:google/gemini-2.5-flash
/setup ai provider type:openai key:sk-proj-... model:gpt-4o-mini
/setup ai provider type:ollama key:unused model:llama3 base_url:http://localhost:11434/v1
```

### `/setup ai channel <channel>`

Restrict AI responses to a single channel in the server. The bot will ignore all messages in other channels for AI processing.

**Example:**
```
/setup ai channel #ask-ai
```

To allow responses in all channels again, remove the setting by running `setup ai channel` without the option (not currently supported — reset by removing the bot's database row or using the in-memory reset on restart).

## Persistence

Settings are stored in the `guilds` table (PostgreSQL) when available, and in memory otherwise. Without PostgreSQL, settings reset on bot restart.

## Order of precedence

1. `/setup ai provider` override (per-guild) — highest priority
2. Global `providers[]` in `config.yaml` — fallback

If neither a per-guild provider nor any global provider succeeds, the bot returns a static fallback message and locks the thread (kills the provider chain for that conversation).
