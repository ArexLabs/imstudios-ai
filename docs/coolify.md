# Deploying on Coolify

## Prerequisites

- A Coolify instance (self-hosted or cloud)
- A Git repository containing the project
- Your Discord bot token and LLM API tokens ready

## Step 1 — Create a new resource

1. Click **Create New Resource** → **Private Repository** (or **Public Repository**).
2. Connect your Git repository.

## Step 2 — Configure

| Setting | Value |
|---------|-------|
| **Build Pack** | `Dockerfile` |
| **Port** | (leave empty — bot doesn't expose HTTP) |
| **Base Directory** | `/` |

The included [Dockerfile](../Dockerfile) handles everything — multi-stage install, type-check, and production build.

## Step 3 — Config file + Docker Compose

The bot can work **with or without** PostgreSQL and Redis.

### Option A: Docker Compose (recommended for full features)

1. In Coolify, create a **Docker Compose** resource.
2. Paste the contents of [`compose.yaml`](../compose.yaml).
3. Coolify will deploy Postgres, Redis, and the bot together.
4. Add your `config.yaml` as a Coolify file mount at `/app/config.yaml`.

### Option B: Standalone container (database-optional)

1. Deploy the bot as a single Docker container from your Git repository.
2. Create a `config.yaml` in Coolify's file storage at `/app/config.yaml`.
3. Omit the `postgres:` and `redis:` sections from `config.yaml` to use in-memory mode.

The bot will work with in-memory rate limiting, concurrency locks, and inline job processing. Auto-titling and summarization will be unavailable.

## Step 4 — Environment variables

No environment variables are required if `config.yaml` is mounted.

For Drizzle migrations, set `POSTGRES_URL` to your Postgres connection string (or include `postgres.url` in `config.yaml`).

## Step 5 — Post-deploy

Once the bot is online, use `/setup` slash commands in your Discord server:

- `/setup logs #channel` — forward bot logs to a channel
- `/setup ai provider openrouter sk-...` — override the AI provider for this server
- `/setup ai channel #channel` — restrict AI responses to one channel

See [setup.md](./setup.md) for details.

## Step 5 — Deploy

Click **Deploy** and watch the logs. The bot connects to Discord after Postgres and Redis are healthy.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `config.yaml not found` | Config not mounted | Create `/app/config.yaml` in Coolify's file storage |
| Can't connect to Postgres/Redis | Network isolation | Ensure all services share the same Coolify network |
| Docker build fails | Missing dependencies | Check `bun install` completes; increase build timeout |
| Auto-title doesn't work | No PostgreSQL | Either add PostgreSQL or accept this feature is unavailable |
| `/setup` command not found | Commands not registered | Wait up to 1 hour for global commands to propagate |
