import { loadConfig } from "./config/loader.ts";
import { createDb } from "./db/index.ts";
import { createRedis } from "./lib/redis.ts";
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

  console.log("[boot] Connecting to Postgres...");
  createDb(config);

  console.log("[boot] Creating BullMQ queue...");
  createQueue(config);

  console.log("[boot] Creating BullMQ worker...");
  createWorker(config);

  console.log("[boot] Starting summary cron...");
  startSummaryCron(config);

  console.log("[boot] Starting Discord gateway...");
  await startGateway(config);

  console.log("[boot] System ready. Listening for Discord events...");
}

main().catch((err) => {
  console.error("[boot] Fatal error:", err);
  process.exit(1);
});
