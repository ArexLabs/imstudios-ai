# Local Development

> **For development only** — for production, use [Docker Compose](../compose.yaml), [Coolify](./coolify.md), [Dokploy](./dokploy.md), or [Pterodactyl](./pterodactyl.md).

## Prerequisites

- [Bun](https://bun.sh) 1.3+ (`curl -fsSL https://bun.sh/install | bash`)

## Quick start (without databases)

The bot works without PostgreSQL and Redis for local testing:

```bash
# 1. Install dependencies
bun install

# 2. Create config from template — omit redis and postgres sections
cp config.example.yaml config.yaml
# Edit config.yaml: remove or comment out the postgres: and redis: blocks

# 3. Start the bot
bun run dev
```

The bot will start with in-memory rate limiting, concurrency locks, and inline job processing. Auto-titling, summarization, and message persistence will be unavailable.

## Full setup (with databases)

```bash
# 1. Install dependencies
bun install

# 2. Create config from template
cp config.example.yaml config.yaml
nano config.yaml

# 3. Start Postgres & Redis
docker compose up -d postgres redis

# 4. Push database schema
bun run db:push

# 5. Start the bot
bun run dev
```

## Keeping the bot running

- `bun run dev` watches for file changes and restarts automatically.
- `bun run start` runs once without watching.
- Press `Ctrl+C` to stop.

## Post-deploy configuration

Once the bot is running, use the `/setup` slash commands in your Discord server:

- `/setup logs #channel` — forward bot logs to a channel
- `/setup ai provider openrouter sk-...` — override the AI provider for this guild
- `/setup ai channel #channel` — restrict AI responses to one channel

See [setup.md](./setup.md) for details.

## Updating

```bash
git pull
bun install
bun run db:push
bun run dev
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `bun: command not found` | Bun not installed | `curl -fsSL https://bun.sh/install \| bash` |
| Config validation error | Missing/invalid `config.yaml` | `cp config.example.yaml config.yaml` and fill tokens |
| Postgres connection refused | Postgres not running | `docker compose up -d postgres` |
| Redis connection refused | Redis not running | `docker compose up -d redis` |
| Discord bot doesn't come online | Invalid token | Verify `config.yaml` → `discord.token` |
| `Relation "guilds" does not exist` | Schema not pushed | `bun run db:push` |
| Auto-title / summary don't work | No PostgreSQL | Either add a `postgres:` config block or accept these features are unavailable |
