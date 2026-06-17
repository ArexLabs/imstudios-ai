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

## Prerequisites

- A **Discord bot token** from the [Discord Developer Portal](https://discord.com/developers/applications)
- An **API token** for your chosen LLM provider — see [providers.md](./providers.md)
- A **PostgreSQL** and **Redis** instance (Docker Compose provides both)

## Common to all deployments

1. The bot reads all configuration from `config.yaml` (see [`config.example.yaml`](../config.example.yaml)).
2. After changing `config.yaml`, **restart** the bot for changes to take effect.
3. The bot responds to messages in all channels it can see (filtered by the `autoReply` feature flag).
