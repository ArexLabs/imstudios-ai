# Deployment Guide

This directory contains step-by-step instructions for deploying the Discord LLM Bot in various environments.

## Quick links

| Platform     | Guide                              | Recommendation      |
|-------------|------------------------------------|---------------------|
| Pterodactyl | [pterodactyl.md](./pterodactyl.md) | Recommended         |
| Coolify     | [coolify.md](./coolify.md)         | Recommended         |
| Dokploy     | [dokploy.md](./dokploy.md)         | Recommended         |
| Local       | [local.md](./local.md)             | Development only    |

## Before you start

You need:

- A **Discord bot token** from the [Discord Developer Portal](https://discord.com/developers/applications)
- An **API token** for your chosen LLM provider (see [config.example.yaml](../config.example.yaml) for supported providers)
- The **channel ID** of the Discord channel the bot should listen in (enable Developer Mode in Discord, right-click the channel → Copy ID)

## Common to all deployments

1. The bot reads all configuration from `config.yaml`. See [config.example.yaml](../config.example.yaml) for the template.
2. After changing `config.yaml`, you must **restart** the bot for changes to take effect.
3. The bot only responds to messages in the channel specified by `target_channel_id`.

## Need help?

Check the provider-specific page for troubleshooting tips. If the bot won't start, run it with `uv run bot` locally first to see the full error message.
