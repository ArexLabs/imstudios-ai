# Deploying on Dokploy

## Prerequisites

- A Dokploy instance (self-hosted)
- A Git repository containing this project
- Your Discord bot token and LLM API tokens ready

## Step 1 — Create Service → Compose

1. Click **Create Service** → **Compose**.
2. Select your Git repository and branch.
3. Set **Compose Path** to `compose.yaml`.
4. Click **Save**.

Dokploy will deploy Postgres, Redis, and the bot together from the single compose file.

## Step 2 — Config file

The bot requires a `config.yaml` at `/app/config.yaml` inside the container. There are two ways to provide it:

### Option A: File Mount (recommended)

1. In Dokploy, go to **Advanced** → **Mounts** → **File Mounts**.
2. Create a file mount with:
   - **Container Path**: `/app/config.yaml`
   - **Content**: Paste the contents of [`config.example.yaml`](../config.example.yaml) (or [`config.template.yaml`](../config.template.yaml)) and fill in your values.

### Option B: Volume mount

1. Place your `config.yaml` on the Dokploy host, e.g. `/data/imstudios/config.yaml`.
2. In your compose service settings, go to **Volumes** and add:

| Container Path | Host Path |
|---------------|-----------|
| `/app/config.yaml` | `/data/imstudios/config.yaml` |

### Option C: Dokploy Patches

Use Dokploy's **Patches** feature to create or modify `config.yaml` during the build:

1. Go to the **Patches** tab.
2. Click **Create New File**.
3. Path: `config.yaml`
4. Paste your configuration and save.

> **Tip:** Use [`config.template.yaml`](../config.template.yaml) as a starting point — it references environment variables via `${VAR}` syntax that Dokploy can substitute.

## Step 3 — Database-optional mode

If you don't need PostgreSQL and Redis, you can remove them from the compose file:

1. Remove the `postgres:` and `redis:` services from `compose.yaml`.
2. Remove the `depends_on` block from `discord-bot`.
3. Remove the `postgres:` and `redis:` or set them to empty in `config.yaml`.

The bot will fall back to in-memory storage for rate limiting and concurrency locking.

## Step 4 — Post-deploy

Once the bot is online, configure it per-guild using `/setup` commands:

- `/setup logs #channel` — forward logs to a Discord channel
- `/setup ai provider openrouter sk-...` — set an AI provider
- `/setup ai channel #channel` — restrict AI responses to one channel

See [setup.md](./setup.md) for details.

## Step 5 — Deploy

Click **Deploy** and monitor the logs. The bot connects to Discord after Postgres and Redis are healthy.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Compose file parse error | Invalid YAML | Validate the compose file |
| `config.yaml not found` | Config not mounted | Verify volume mount path or file mount |
| Container exits immediately | Config validation error | Check container logs — the error pinpoints the missing key |
| `/setup` command not found | Commands not registered | Wait up to 1 hour for global commands to propagate, or restart the bot |
