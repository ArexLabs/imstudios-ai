# Deploying on Pterodactyl

## Prerequisites

- A Pterodactyl panel with access to create a server
- Your Discord bot token and LLM API token ready

## Step 1 — Create the server

1. In your Pterodactyl panel, click **Create New Server**.
2. Fill in:
   - **Name**: `discord-llm-bot` (or any name you prefer)
   - **Description**: optional
   - **Owner**: your account
3. Under **Egg**, search for and select **Python** (generic Python egg).
4. Set **Allocation** to any available port (the bot doesn't use HTTP).
5. Click **Create Server**.

## Step 2 — Configure the egg (startup command)

In the **Startup** tab:

1. Set **Startup Command** to:

```
uv run bot
```

2. The egg should auto-install UV. If not, add a pre-install script:

```bash
pip install uv
```

## Step 3 — Upload the files

1. Go to the **File Manager**.
2. Upload the entire project (everything except `.venv/`, `__pycache__/`, and `config.yaml` — you'll create that manually).
3. Create `config.yaml` in the root directory with your tokens:

```yaml
discord:
  token: "YOUR_DISCORD_BOT_TOKEN"
  target_channel_id: YOUR_CHANNEL_ID

provider:
  name: huggingface
  max_tokens: 500
  system_prompt: "Du bist ein hilfreicher Discord-Assistent. Antworte kurz auf Deutsch."

  huggingface:
    model: "Qwen/Qwen2.5-7B-Instruct"
    token: "YOUR_HF_TOKEN"

  # Uncomment and fill in for other providers:
  # openrouter:
  #   model: "openai/gpt-4o"
  #   token: "YOUR_OPENROUTER_TOKEN"
```

## Step 4 — Startup configuration

- **Memory**: at least 256 MB (512 MB recommended)
- **Disk**: at least 512 MB
- **Installer Limits**: long enough for `uv sync` to complete (default is fine)

## Step 5 — Start the server

1. Go to the **Console** tab.
2. Click **Start**.
3. Watch the logs. You should see:

```
2026-06-16 12:00:00 [INFO] bot: Bot logged in as YourBot#1234 | Provider: huggingface
```

## Updating

1. **Stop** the server.
2. Replace the project files with the new version.
3. **Start** the server.
4. Your `config.yaml` is preserved (back it up before replacing just in case).

## Restarting

Use the **Restart** button in the panel, or from the console:

```
^C (Ctrl+C) → wait for stop → click Start
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ConfigError: Missing required config` | `config.yaml` missing or incomplete | Check the file exists in the root and has valid tokens |
| `ImportError: No module named '...'` | Dependencies not installed | Run `uv sync` manually from the file manager console |
| `ModuleNotFoundError: No module named 'bot'` | Wrong working directory | Ensure the egg's working directory is the project root |
| Bot doesn't respond | Wrong channel ID | Double-check `target_channel_id` in `config.yaml` |
| Connection refused / timeout | Outbound firewall rules | Pterodactyl nodes need outbound HTTPS access for API calls |
