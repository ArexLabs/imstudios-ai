import type { Config } from "../config/types.ts";
import { acquireLock } from "../lib/concurrency-lock.ts";
import { checkRateLimit } from "../lib/rate-limiter.ts";
import { getQueue } from "./index.ts";
import type { AiProcessingJobData } from "./types.ts";

export interface PublishResult {
  accepted: boolean;
  reason?: "rate_limited" | "concurrency_locked";
}

export async function publishMessage(
  data: AiProcessingJobData,
  config: Config,
): Promise<PublishResult> {
  const rateCheck = await checkRateLimit(
    data.authorId,
    config.ai.rateLimit.maxPerMinute,
  );

  if (!rateCheck.allowed) {
    console.warn(
      `[publisher] Rate limit exceeded for user ${data.authorId}`,
    );
    return { accepted: false, reason: "rate_limited" };
  }

  const locked = await acquireLock(data.channelId, data.authorId);

  if (!locked) {
    console.warn(
      `[publisher] Concurrency lock held for user ${data.authorId} in channel ${data.channelId}`,
    );
    return { accepted: false, reason: "concurrency_locked" };
  }

  const queue = getQueue();
  await queue.add("ai-message", data);

  console.log(
    `[publisher] Enqueued job for user ${data.authorId} in channel ${data.channelId}`,
  );

  return { accepted: true };
}
