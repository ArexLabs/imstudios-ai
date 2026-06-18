import { loadConfig } from "./config/loader.ts";
import { createDb } from "./db/index.ts";
import { createRedis } from "./lib/redis.ts";
import { createRestClient } from "./lib/discord-rest.ts";
import { createQueue } from "./queue/index.ts";
import { createWorker } from "./queue/worker.ts";
import { startGateway } from "./gateway/index.ts";
import { startSummaryCron } from "./ai/summary.ts";

async function main() {
  console.log("[boot] Loading config...");
  const config = loadConfig();
  console.log(`[boot] Config loaded. ${config.providers.length} AI provider(s) configured.`);

  console.log("[boot] Connecting to Redis...");
  createRedis(config);

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
  console.log(`[boot]  autoReply=${config.features.autoReply} autoTitle=${config.features.autoTitle} summarization=${config.features.summarization} rateLimiting=${config.features.rateLimiting} concurrencyLock=${config.features.concurrencyLock}`);
}

main().catch((err) => {
  console.error("[boot] Fatal error:", err);
  process.exit(1);
});
