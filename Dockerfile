# ─── Base ───────────────────────────────────────────────
FROM oven/bun:latest AS base
WORKDIR /app

# ─── Dependencies ───────────────────────────────────────
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Type-check ─────────────────────────────────────────
FROM base AS check
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src/ ./src/
RUN bun run lint

# ─── Release ────────────────────────────────────────────
FROM oven/bun:alpine AS release
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=check /app/src ./src
COPY --from=check /app/package.json ./

USER app
CMD ["bun", "run", "src/index.ts"]
