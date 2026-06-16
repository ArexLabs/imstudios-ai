# Local deployment

> **⚠️ Development only — not recommended for production.**
>
> Running the bot on your local machine is suitable for testing and development. For a reliable 24/7 deployment, use [Pterodactyl](./pterodactyl.md), [Coolify](./coolify.md), or [Dokploy](./dokploy.md).

## Prerequisites

- Python 3.11+
- [UV](https://docs.astral.sh/uv/) (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- A Discord bot token and LLM API token

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO

# 2. Install dependencies
uv sync

# 3. Create your config from the template
cp config.example.yaml config.yaml

# 4. Edit config.yaml with your tokens and channel ID
nano config.yaml   # or vim, code, etc.
```

## Usage

```bash
# Start the bot
uv run bot
```

Press `Ctrl+C` to stop.

## Keeping the bot running

For local testing, the bot runs in your terminal session. If you close the terminal, the bot stops.

**Do NOT use** `nohup`, `screen`, `tmux`, or `systemd` for production — those belong to the production guides linked above. For quick tests, `uv run bot` is all you need.

## Updating

```bash
git pull
uv sync
uv run bot
```

## Restarting

Press `Ctrl+C` to stop, then `uv run bot` again.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `uv: command not found` | UV not installed | Run `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| `ConfigError: Missing required config` | `config.yaml` not set | Run `cp config.example.yaml config.yaml` and fill in your tokens |
| `ImportError` | Dependencies not installed | Run `uv sync` |
| Discord bot doesn't come online | Invalid token | Double-check the token in `config.yaml` — it should look like `MTE4Nz...` |
| Bot joins but doesn't respond | Wrong channel ID | Enable Developer Mode in Discord → right-click your channel → Copy ID. Verify it matches `target_channel_id` |
| Rate limit errors | Too many requests | Increase `max_tokens` or add a delay between messages (not configurable — the provider SDK handles retries) |
