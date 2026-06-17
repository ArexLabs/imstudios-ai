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

The bot needs **PostgreSQL**, **Redis**, and its own `config.yaml`.

### Option A: Docker Compose (recommended)

1. In Coolify, create a **Docker Compose** resource.
2. Paste the contents of [`compose.yaml`](../compose.yaml).
3. Coolify will deploy Postgres, Redis, and the bot together.
4. Add your `config.yaml` as a file mount or Coolify's file storage at `/app/config.yaml`.

### Option B: Standalone container

1. Deploy the bot as a single container from your Git repository.
2. Deploy Postgres and Redis separately (Coolify has ready-to-use templates).
3. Create a `config.yaml` file in Coolify's file storage at `/app/config.yaml`.

## Step 4 — Environment variables

No environment variables are required if `config.yaml` is mounted.

For Drizzle migrations, set `POSTGRES_URL` to your Postgres connection string (or include `postgres.url` in `config.yaml`).

## Step 5 — Deploy

Click **Deploy** and watch the logs. The bot connects to Discord after Postgres and Redis are healthy.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `config.yaml not found` | Config not mounted | Create `/app/config.yaml` in Coolify's file storage |
| Can't connect to Postgres/Redis | Network isolation | Ensure all services share the same Coolify network |
| Docker build fails | Missing dependencies | Check `bun install` completes; increase build timeout |
