import { loadConfig } from "./config/loader.ts";
import { createDb } from "./db/index.ts";
import { createRedis } from "./lib/redis.ts";
import { createQueue } from "./queue/index.ts";
import { createWorker } from "./queue/worker.ts";
import { startGateway } from "./gateway/index.ts";
import type { AiProcessingJobData } from "./queue/types.ts";
import type { Config } from "./config/types.ts";

async function stubAiHandler(
  data: AiProcessingJobData,
  _config: Config,
): Promise<string> {
  console.log(`[ai-stub] Processing from user ${data.authorId}: "${data.content.slice(0, 60)}..."`);
  return `Echo: ${data.content}`;
}

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
  createWorker(config, stubAiHandler);

  console.log("[boot] Starting Discord gateway...");
  await startGateway(config);

  console.log("[boot] System ready. Listening for Discord events...");
}

main().catch((err) => {
  console.error("[boot] Fatal error:", err);
  process.exit(1);
});
