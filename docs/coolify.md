# Deploying on Coolify

## Prerequisites

- A Coolify instance (self-hosted or cloud)
- Your Discord bot token and LLM API token ready
- A Git repository containing the project (GitHub, GitLab, etc.)

## Step 1 — Create a new resource

1. In Coolify, click **Create New Resource** → **Private Repository** (or **Public Repository**).
2. Connect your Git repository.

## Step 2 — Configure the build

Configure the resource with these settings:

| Setting | Value |
|---------|-------|
| **Build Pack** | `Dockerfile` |
| **Port** | (leave empty — the bot doesn't expose HTTP) |
| **Install Command** | `uv sync` |
| **Start Command** | `uv run bot` |
| **Base Directory** | `/` |

If Coolify's Python Nixpacks template supports `pyproject.toml`, you can use **Nixpacks** instead of Docker and skip the Dockerfile section below.

### Optional: Dockerfile

If your Coolify instance requires a Dockerfile, create one in the project root:

```dockerfile
FROM python:3.11-slim

RUN pip install uv

WORKDIR /app
COPY . .

RUN uv sync

CMD ["uv", "run", "bot"]
```

Add `.dockerignore` (if not already in `.gitignore`):

```
.venv
__pycache__
*.pyc
.git
README.md
```

## Step 3 — Environment variables

In Coolify's **Environment Variables** tab, add a single variable for the config:

There are two approaches:

### A) Use a `config.yaml` file (recommended)

1. In Coolify, use the **File** storage type to create `/app/config.yaml` with your configuration.
2. No environment variables needed — the bot reads `config.yaml` directly.

### B) Inline environment variables

If you prefer env vars, expose each token individually. The bot currently reads from `config.yaml`, so you would need to create it via a startup script.

## Step 4 — Deploy

1. Click **Deploy**.
2. Watch the **Deployment Logs**. The bot should come online after the build completes.

## Updating

1. Push new code to your Git repository.
2. Coolify will automatically trigger a new deployment (if webhooks are configured).
3. Or click **Deploy** manually.

## Restarting

Use the **Restart** button in Coolify's resource view.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `config.yaml not found` | Config not uploaded | Use Coolify's file storage to create `/app/config.yaml` |
| Deployment hangs | Dependency install taking too long | Increase the build timeout in Coolify settings |
| Bot crashes on start | Missing token in config | Verify `config.yaml` is present and valid |
| "uv: command not found" | UV not installed on the build image | Use the Dockerfile approach above or install UV via install command: `pip install uv && uv sync` |
