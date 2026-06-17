# Deploying on Dokploy

## Prerequisites

- A Dokploy instance (self-hosted)
- Your Discord bot token and LLM API tokens ready

## Step 1 — Create Service → Compose

1. Click **Create Service** → **Compose**.
2. Paste the contents of [`compose.yaml`](../compose.yaml).
3. Click **Save**.

Dokploy will deploy Postgres, Redis, and the bot together from the single compose file.

## Step 2 — Config file

Create a `config.yaml` on the Dokploy host, e.g. `/data/imstudios/config.yaml`, and mount it into the bot container:

1. In your Dokploy compose service, go to the **discord-bot** service settings.
2. Under **Volumes**, add:

| Container Path | Host Path |
|---------------|-----------|
| `/app/config.yaml` | `/data/imstudios/config.yaml` |

Alternatively, if Dokploy's compose editor supports inline volumes, add:

```yaml
volumes:
  - /data/imstudios/config.yaml:/app/config.yaml:ro
```

under the `discord-bot` service in the compose file.

## Step 3 — Deploy

Click **Deploy** and monitor the logs. The bot connects to Discord after Postgres and Redis are healthy.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Compose file parse error | Invalid YAML | Validate the compose file at [yamlchecker.com](https://yamlchecker.com) |
| `config.yaml not found` | Config not mounted | Verify volume mount path in Dokploy service settings |
| Container exits immediately | Config validation error | Check container logs — the error pinpoints the missing key |
