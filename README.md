# imstudios AI — Discord Bot

A modern, resilient Discord AI bot built with **Discordeno**, **Bun**, **PostgreSQL + Drizzle ORM**, **BullMQ + Redis**, and the **Vercel AI SDK**.

## Architecture

```
Gateway (Discordeno) → BullMQ Queue → Worker (Vercel AI SDK) → Discord REST
                              ↕
                    Postgres (Drizzle ORM)
                              ↕
                    Redis (rate limiter / locks)
```

| Layer | Tech | Role |
|-------|------|------|
| Gateway | Discordeno | Listens for `messageCreate`, triggers typing indicator, publishes jobs |
| Queue | BullMQ + Redis | Reliable job delivery, 3x exponential-backoff retries |
| Worker | Vercel AI SDK | Multi-provider AI inference with automatic failover |
| Database | PostgreSQL + Drizzle | Guilds, threads, messages with relational schema |
| Cache | Redis (ioredis) | Rate limiting (15/min/user), concurrency locks per channel+user |
| Scheduling | croner | 2-minute summary generation for context window management |

## Quick start

```bash
# 1. Install dependencies
bun install

# 2. Copy & edit config
cp config.example.yaml config.yaml
nano config.yaml

# 3. Start Postgres & Redis (or use your own)
docker compose up -d postgres redis

# 4. Push DB schema
bun run db:push

# 5. Run the bot
bun run dev
```

## Configuration

All configuration lives in `config.yaml` (gitignored). See [`config.example.yaml`](./config.example.yaml) for the full template.

Key sections:
- **`discord`** — Bot token, optional webhook for critical errors
- **`postgres`** / **`redis`** — Connection settings
- **`providers[]`** — Ordered list of AI providers (tried in sequence; first success wins, all-fail trips a kill-switch)
- **`ai`** — System prompt, max tokens, rate limits, summary cron, auto-titling
- **`features`** — Toggle subsystems on/off (`auto_reply`, `auto_title`, `summarization`, `rate_limiting`, `concurrency_lock`)
- **`search`** — Web search (RAG) configuration

## Providers

| Provider | Config name | Type |
|----------|-----------|------|
| OpenAI / ChatGPT | `openai` | OpenAI-compatible |
| OpenRouter | `openrouter` | OpenAI-compatible |
| HuggingFace | `huggingface` | OpenAI-compatible |
| Anthropic / Claude | `anthropic` | Anthropic SDK |
| Google / Gemini | `gemini` | Google Generative AI SDK |
| Any OpenAI-compatible | `*` | OpenAI-compatible |

See [docs/providers.md](./docs/providers.md) for API keys, free tiers, and model recommendations.

## Deployment

| Platform | Guide |
|----------|-------|
| Docker Compose | [compose.yaml](./compose.yaml) — `docker compose up -d` |
| Coolify | [docs/coolify.md](./docs/coolify.md) |
| Dokploy | [docs/dokploy.md](./docs/dokploy.md) |
| Pterodactyl | [docs/pterodactyl.md](./docs/pterodactyl.md) |
| Local | [docs/local.md](./docs/local.md) |

## Project structure

```
src/
├── index.ts              # Entry point
├── config/               # Zod-validated config loader
├── db/                   # Postgres connection + Drizzle schema
│   └── schema/           # guilds, threads, messages
├── ai/                   # Vercel AI SDK multi-provider wrapper + summary cron
├── gateway/              # Discordeno gateway event listener
├── queue/                # BullMQ publisher + worker
└── lib/                  # Redis, rate-limiter, concurrency lock, REST client,
                          # auto-titling, message chunker
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Watch mode development |
| `bun run start` | Production start |
| `bun run db:push` | Push Drizzle schema to Postgres |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run lint` | TypeScript type-check |
