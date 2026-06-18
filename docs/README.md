# Deployment Guides

This directory contains deployment instructions for various platforms.

| Platform | Guide | Recommendation |
|----------|-------|----------------|
| Docker Compose | [compose.yaml](../compose.yaml) | **Recommended** |
| Coolify | [coolify.md](./coolify.md) | Recommended |
| Dokploy | [dokploy.md](./dokploy.md) | Recommended |
| Pterodactyl | [pterodactyl.md](./pterodactyl.md) | Recommended |
| Local | [local.md](./local.md) | Development only |
| Providers | [providers.md](./providers.md) | Start here |
| Setup Commands | [setup.md](./setup.md) | Post-deploy configuration |

## Prerequisites

- A **Discord bot token** from the [Discord Developer Portal](https://discord.com/developers/applications)
- An **API token** for your chosen LLM provider — see [providers.md](./providers.md)

Databases are **optional**. Without them the bot runs in in-memory mode:
- No PostgreSQL → auto-titling, summarization, and message history are disabled
- No Redis → rate limiting and concurrency locking use in-memory fallbacks, jobs process inline

## Common to all deployments

1. The bot reads all configuration from `config.yaml` (see [`config.example.yaml`](../config.example.yaml)).
2. After changing `config.yaml`, **restart** the bot for changes to take effect.
3. Use `/setup` slash commands post-deploy to configure logging, AI providers, and AI channels per guild — see [setup.md](./setup.md).
