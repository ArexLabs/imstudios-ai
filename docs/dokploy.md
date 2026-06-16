# Deploying on Dokploy

## Prerequisites

- A Dokploy instance (self-hosted)
- Your Discord bot token and LLM API token ready
- A Git repository containing the project (GitHub, GitLab, etc.)

## Step 1 — Create a new application

1. In Dokploy, click **New Application** → **Git**.
2. Connect your Git repository and select the branch (e.g. `main`).

## Step 2 — Configure the application

| Setting | Value |
|---------|-------|
| **Build Type** | `Dockerfile` |
| **Port** | (leave empty) |
| **Command** | `uv run bot` |

### Dockerfile

Create a `Dockerfile` in the project root (if one doesn't exist):

```dockerfile
FROM python:3.11-slim

RUN pip install uv

WORKDIR /app
COPY . .

RUN uv sync

CMD ["uv", "run", "bot"]
```

## Step 3 — Config file

Dokploy doesn't support in-panel file editing like Coolify, so you have two options:

### Option A: Mount a config volume

1. On the Dokploy host, create `/data/discord-bot/config.yaml`:

```yaml
discord:
  token: "YOUR_DISCORD_BOT_TOKEN"
  target_channel_id: YOUR_CHANNEL_ID

provider:
  name: huggingface
  max_tokens: 500
  system_prompt: "Du bist ein hilfreicher Discord-Assistent."

  huggingface:
    model: "Qwen/Qwen2.5-7B-Instruct"
    token: "YOUR_HF_TOKEN"
```

2. In Dokploy, mount the file as a volume:

| Container Path | Host Path |
|---------------|-----------|
| `/app/config.yaml` | `/data/discord-bot/config.yaml` |

### Option B: Bake the config into the Docker image

1. Create `config.yaml` locally.
2. Add it to `.gitignore` — **never commit secrets**.
3. Instead, use CI/CD secrets to write it during build, or manage it outside version control.

## Step 4 — Deploy

1. Click **Deploy**.
2. Monitor the logs in Dokploy's log viewer.

## Updating

1. Push new code to your Git repository.
2. In Dokploy, click **Redeploy**. Dokploy will rebuild and restart.

## Restarting

Use the **Restart** button in Dokploy's application view.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| File not found errors | Config volume not mounted | Verify the mount path in Dokploy settings |
| Permission denied on `uv` | Wrong base image | Use `python:3.11-slim` — it has full write permissions on `/app` |
| `uv sync` fails during build | Network timeout | Add `--timeout 120` to `uv sync` or increase Docker build timeout in Dokploy |
| Container exits immediately | Config validation error | Check the container logs — they show exactly which config key is missing |
| Can't see logs | Dokploy log retention | Set up [Dokploy log drains](https://dokploy.com/docs/logs) for persistent logs |
