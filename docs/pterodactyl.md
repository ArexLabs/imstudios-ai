# Deploying on Pterodactyl

## Prerequisites

- A Pterodactyl panel with access to create a server
- Your Discord bot token and LLM API tokens ready

## Step 1 — Create the server

1. Click **Create New Server**.
2. **Name**: `imstudios-bot` (or any name)
3. **Egg**: Select a **Docker** or **Bun** egg. If none exists, use a generic Linux egg and provide the Dockerfile.
4. **Allocation**: Any port (bot doesn't use HTTP).

## Step 2 — Upload files

Upload the entire project (excluding `config.yaml` — create that manually).

## Step 3 — Config file (no databases)

Pterodactyl doesn't provide PostgreSQL or Redis by default. Create `config.yaml` without the database sections:

```yaml
discord:
  token: "YOUR_DISCORD_BOT_TOKEN"

ai:
  maxTokens: 500
  systemPrompt: "You are a helpful Discord assistant."

providers:
  - name: openrouter
    model: "google/gemini-2.5-flash"
    token: "YOUR_OPENROUTER_TOKEN"
    baseUrl: "https://openrouter.ai/api/v1"

features:
  autoReply: true
  rateLimiting: true
  concurrencyLock: true

search:
  enabled: false
```

> **Note:** The `postgres:` and `redis:` sections are optional. Without them, the bot uses in-memory storage for rate limiting and concurrency locking. Auto-titling and summarization will be unavailable.

If you do have external PostgreSQL and/or Redis instances, add their config:
```yaml
redis:
  host: "your-redis-host"
  port: 6379

postgres:
  host: "your-postgres-host"
  port: 5432
  database: "imstudios"
  user: "postgres"
  password: "YOUR_PG_PASSWORD"
```

## Step 4 — Startup command

Set the startup command to:

```
bun run src/index.ts
```

## Step 5 — Post-deploy

Once the bot is online, configure it per-guild using `/setup` slash commands:

- `/setup logs #channel` — forward bot logs to a Discord channel
- `/setup ai provider openrouter sk-...` — set a per-guild AI provider (useful if you don't have PostgreSQL and want provider overrides)
- `/setup ai channel #channel` — restrict AI responses to a single channel

See [setup.md](./setup.md) for details.

## Step 6 — Start

Click **Start** and watch the console logs.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `bun: command not found` | Bun not installed | Use a Bun egg or install Bun manually |
| Config validation error | Missing `config.yaml` | Create `config.yaml` in project root |
| Can't connect to Postgres/Redis | Not running | Set up separate instances or remove those config sections |
| `/setup` command not found | Commands not registered | Wait up to 1 hour for global commands to propagate |
