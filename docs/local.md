# Local Development

> **For development only** — for production, use [Docker Compose](../compose.yaml), [Coolify](./coolify.md), [Dokploy](./dokploy.md), or [Pterodactyl](./pterodactyl.md).

## Prerequisites

- [Bun](https://bun.sh) 1.3+ (`curl -fsSL https://bun.sh/install | bash`)
- [Docker](https://docker.com) (for Postgres & Redis)

## Setup

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
