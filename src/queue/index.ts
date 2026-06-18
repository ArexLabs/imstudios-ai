import { Queue } from "bullmq";
import type { Config } from "../config/types.ts";
import { hasRedis } from "../lib/redis.ts";

const QUEUE_NAME = "ai-processing";

let _queue: Queue | null = null;

export function createQueue(config: Config): Queue | null {
  if (!hasRedis()) {
    console.log("[queue] No Redis — BullMQ queue disabled, processing inline");
    return null;
  }

  _queue = new Queue(QUEUE_NAME, {
    connection: {
      host: config.redis!.host,
      port: config.redis!.port,
      password: config.redis!.password || undefined,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });
  return _queue;
}

export function getQueue(): Queue | null {
  return _queue;
}
