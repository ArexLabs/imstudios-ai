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

## Step 3 — Config file

Create `config.yaml` in the root directory:

```yaml
discord:
  token: "YOUR_DISCORD_BOT_TOKEN"

redis:
  host: "localhost"
  port: 6379

postgres:
  host: "localhost"
  port: 5432
  database: "imstudios"
  user: "postgres"
  password: "YOUR_PG_PASSWORD"

ai:
  system_prompt: "You are a helpful Discord assistant."

providers:
  - name: openrouter
    model: "google/gemini-2.5-flash"
    token: "YOUR_OPENROUTER_TOKEN"
```

> **Note**: Pterodactyl doesn't provide Postgres or Redis by default. You need to either:
> - Run them as separate Pterodactyl servers
> - Use an external managed database/Redis service
> - Or use Docker Compose on a VM instead

## Step 4 — Startup command

Set the startup command to:

```
bun run src/index.ts
```

## Step 5 — Start

Click **Start** and watch the console logs.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `bun: command not found` | Bun not installed | Use a Bun egg or install Bun manually |
| Config validation error | Missing `config.yaml` | Create `config.yaml` in project root |
| Can't connect to Postgres/Redis | Not running | Set up separate Postgres/Redis instances |
