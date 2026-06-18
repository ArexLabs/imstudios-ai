# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **setup**: Add `/setup logs <channel>` slash command to forward bot logs to a Discord channel
- **setup**: Add `/setup ai provider <type> <key>` slash command to configure per-guild AI provider overrides
- **setup**: Add `/setup ai channel <channel>` slash command to restrict AI responses to a single channel
- **setup**: Register global `/setup` slash command automatically on bot startup
- **setup**: Log forwarder intercepts `console.log/warn/error`, batches output, and sends to configured channels
- **setup**: Per-guild settings manager with PostgreSQL persistence and in-memory fallback
- **ci**: Add GitHub Actions CI workflow — type-check on push/PR to main
- **ci**: Add Docker workflow — build and push to `ghcr.io` on version tags
- **ci**: Add bug report and feature request issue forms
- **ci**: Add pull request template
- **docs**: Create `docs/setup.md` documenting all slash commands
- **dokploy**: Add Dokploy declarative deployment configuration (`dokploy.yaml`)
- **dokploy**: Add config template for Dokploy file mounts (`config.template.yaml`)
- **config**: Add snake_case to camelCase automatic key transformation in config loader, supporting both naming conventions
- **db**: Add `postgres.url` connection support to `createDb()`
- **memory-store**: Add in-memory fallback for rate limiting and concurrency locking when Redis is not available
- **search**: Export `SearchConfig` interface for external consumers
- **search**: Add markdown escaping in search result titles
- **todo**: Create `TODO.md` with future feature ideas

### Fixed

- **config**: Remove unused `discord.webhookUrl` field from schema
- **publisher**: Respect `features.rateLimiting` flag — rate limiting is now only enforced when enabled
- **publisher**: Respect `features.concurrencyLock` flag — concurrency lock is now only enforced when enabled
- **publisher**: Process AI requests inline when Redis/BullMQ is unavailable instead of silently dropping them
- **summary**: Fix message cutoff logic — now summarizes messages since the last summary timestamp instead of using a hardcoded time window
- **summary**: Handle missing database gracefully by returning empty results
- **worker**: Release concurrency lock on every failure, not just the final retry attempt
- **gateway**: Prevent `String(undefined)` producing `"undefined"` author ID by adding safe checks
- **gateway**: Log typing indicator failures instead of silently swallowing errors
- **discord-rest**: Add error handling for message send failures
- **discord-rest**: Remove unsafe `as CreateMessageOptions` type assertion
- **drizzle**: Apply snake_case→camelCase transformation in drizzle config for consistent config.yaml parsing
- **auto-title**: Handle missing database gracefully by skipping DB-dependent operations
- **provider**: Handle missing database gracefully in thread kill-switch lock

### Changed

- **config**: `redis` section is now optional in the config schema — when omitted, in-memory fallbacks are used
- **config**: `postgres` section is now optional in the config schema — when omitted, persistence and summarization features are disabled
- **config**: Update `config.example.yaml` to use camelCase keys matching the Zod schema
- **queue**: `createQueue()` returns `null` when Redis is not configured (instead of throwing)
- **queue**: `getQueue()` returns `null` when queue was not created (instead of throwing)
- **queue**: `createWorker()` returns `null` when Redis is not configured (instead of throwing)
- **worker**: `getWorker()` returns `null` when worker was not created (instead of throwing)
- **db**: `createDb()` returns `null` when Postgres is not configured (instead of throwing)
- **db**: `getDb()` returns `null` when database was not created (instead of throwing)
- **redis**: `createRedis()` returns `null` when Redis is not configured
- **redis**: `getRedis()` returns `null` when Redis was not created (instead of throwing)
- **search**: Replace DuckDuckGo Instant Answer API with HTML search endpoint for more useful results
- **provider**: `generateResponse()` accepts optional `providersOverride` parameter for per-guild overrides
- **docs**: Update all deployment guides (`coolify.md`, `dokploy.md`, `local.md`, `pterodactyl.md`) for database-optional mode and `/setup` commands
- **docs**: Update `providers.md` to mention per-guild provider overrides
- **docs**: Update `docs/README.md` to note databases are optional and link to setup.md

### Removed

- **config**: Remove unused `discord.webhookUrl` configuration field
- **infra**: Delete duplicate `docker-compose.yml` (superseded by `compose.yaml`)
- **infra**: Delete legacy `config.yaml` (was gitignored and unused)
- **env**: Remove `.env.example` — all configuration lives in `config.yaml`
