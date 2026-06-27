import { loadConfig } from "./config/loader.ts";
import { createDb } from "./db/index.ts";
import { createRedis, waitForRedis } from "./lib/redis.ts";
import { createRestClient } from "./lib/discord-rest.ts";
import { createQueue } from "./queue/index.ts";
import { createWorker } from "./queue/worker.ts";
import { startGateway } from "./gateway/index.ts";
import { startSummaryCron } from "./ai/summary.ts";
import { initLogger } from "./setup/index.ts";

process.on("uncaughtException", (err) => {
  console.error("[process] Uncaught exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[process] Unhandled rejection:", reason);
});

async function main() {
  initLogger();

  console.log("[boot] Loading config...");
  const config = loadConfig();
  console.log(`[boot] Config loaded. ${config.providers.length} AI provider(s) configured.`);

  console.log("[boot] Connecting to Redis...");
  createRedis(config);
  const redisReady = await waitForRedis(12_000);
  if (redisReady) {
    console.log("[boot] Redis ready — BullMQ queue/worker enabled");
  } else {
    console.log("[boot] Redis not available — using in-memory fallbacks, processing inline");
  }

  const hasDb = !!createDb(config);
  if (!hasDb) console.log("[boot] Running without database — persistence disabled");

  console.log("[boot] Creating Discord REST client...");
  createRestClient(config.discord.token);

  console.log("[boot] Creating BullMQ queue...");
  createQueue(config);

  console.log("[boot] Creating BullMQ worker...");
  createWorker(config);

  if (config.features.summarization && hasDb) {
    console.log("[boot] Starting summary cron...");
    startSummaryCron(config);
  } else if (config.features.summarization && !hasDb) {
    console.log("[boot] Summarization requires Postgres — skipping");
  } else {
    console.log("[boot] Summarization disabled via feature flag");
  }

  console.log("[boot] Starting Discord gateway...");
  await startGateway(config);

  console.log("[boot] System ready.");
  console.log(`[boot]  autoReply=${config.features.autoReply} autoTitle=${config.features.autoTitle} summarization=${config.features.summarization} concurrencyLock=${config.features.concurrencyLock} rateLimiting=${config.features.rateLimiting}`);
}

main().catch((err) => {
  console.error("[boot] Fatal error:", err);
  process.exit(1);
});
