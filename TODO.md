# TODO

Ideas and improvements for future iterations.

## Commands & Interactions

- [ ] `/setup` subcommand to unset/reset config (e.g., `/setup ai channel` to clear the AI channel, `/setup ai provider clear` to remove the override)
- [ ] `/setup info` to show current guild configuration
- [ ] `/stats` command — token usage per guild, message counts, rate limit hits
- [ ] `/ping` slash command with latency breakdown (gateway → queue → AI provider)
- [ ] Message context menu action to regenerate the last AI response
- [ ] Thread management commands — `/thread close`, `/thread rename`, `/thread history`

## AI & Providers

- [ ] Conversation memory — use the `messages` table to provide multi-turn context when PostgreSQL is available
- [ ] Per-channel system prompts (override the global `systemPrompt` per channel/guild)
- [ ] Configurable temperature, top_p, and other generation params via `/setup`
- [ ] Streaming responses (Discord's typing indicator while the AI generates, then stream the message)
- [ ] Image input support — detect attached images and forward to multimodal models (GPT-4o, Gemini, Claude)
- [ ] Tool/function calling — let the AI invoke commands (roll dice, fetch weather, etc.)

## Logging & Monitoring

- [ ] Log level filtering for the Discord log channel (only ERROR, only WARN+ etc.)
- [ ] Separate log channels per guild (already partially supported)
- [ ] Prometheus / OpenTelemetry metrics endpoint for observability
- [ ] Health check HTTP endpoint (for Docker health checks / load balancers)

## Database & Persistence

- [ ] JSON file persistence for guild settings when PostgreSQL is unavailable (so settings survive restarts)
- [ ] Migration to add proper `guild_settings` table with typed columns instead of the JSON blob
- [ ] Automatic schema migration on startup (instead of requiring `bun run db:push`)

## Developer Experience

- [ ] Watch mode for config.yaml (auto-restart bot on config change)
- [ ] Unit tests for ai/provider.ts, queue/publisher.ts, and setup/settings.ts
- [ ] Integration test that starts the bot with a fake Discord gateway and verifies message flow
- [ ] Local AI provider support (Ollama / LM Studio) documented in default config
- [ ] `bun run check` alias that runs lint + style + tests in one command

## Documentation

- [ ] Self-hosting guide in README.md (condensed version of docs/)
- [ ] Architecture diagram showing gateway → queue → worker → provider flow
- [ ] Video walkthrough of deployment and `/setup` configuration

## CI / DevOps

- [ ] Docker image tags for major versions (`:v2`, `:v2.1`) in addition to `:latest`
- [ ] Dependabot config for automated dependency PRs
- [ ] Release workflow that creates a GitHub Release on tag push
- [ ] Docker Compose profile for database-optional mode (only the bot service)
