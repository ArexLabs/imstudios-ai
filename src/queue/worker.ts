import { Worker } from "bullmq";
import { releaseLock } from "../lib/concurrency-lock.ts";
import { generateResponse } from "../ai/provider.ts";
import { sendChunkedMessage } from "../lib/discord-rest.ts";
import { tryAutoTitle } from "../lib/auto-title.ts";
import type { AiProcessingJobData } from "./types.ts";
import type { Config } from "../config/types.ts";

const QUEUE_NAME = "ai-processing";

export type AiMessageHandler = (
  data: AiProcessingJobData,
  config: Config,
) => Promise<string>;

let _worker: Worker | null = null;

async function aiHandler(
  data: AiProcessingJobData,
  config: Config,
): Promise<string> {
  const { channelId, content } = data;

  const { text, provider } = await generateResponse(
    {
      systemPrompt: config.ai.systemPrompt,
      messages: [{ role: "user", content }],
      maxTokens: config.ai.maxTokens,
    },
    config,
  );

  console.log(`[worker] AI response from "${provider}": ${text.length} chars`);

  if (config.features.autoReply) {
    await sendChunkedMessage(channelId, text);
  }

  if (config.features.autoTitle) {
    await tryAutoTitle(channelId, config).catch((e) =>
      console.error("[worker] auto-title error:", e),
    );
  }

  return text;
}

export function createWorker(
  config: Config,
  handler: AiMessageHandler = aiHandler,
): Worker {
  _worker = new Worker<AiProcessingJobData>(
    QUEUE_NAME,
    async (job) => {
      const { channelId, authorId } = job.data;

      console.log(
        `[worker] Processing job ${job.id} | user=${authorId} channel=${channelId}`,
      );

      try {
        const response = await handler(job.data, config);

        console.log(
          `[worker] Job ${job.id} completed (${response.length} chars)`,
        );

        await releaseLock(channelId, authorId);
        return response;
      } catch (error) {
        console.error(
          `[worker] Job ${job.id} failed attempt ${job.attemptsMade + 1}:`,
          error,
        );

        if (job.attemptsMade >= 2) {
          await releaseLock(channelId, authorId);
        }

        throw error;
      }
    },
    {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
      },
      concurrency: 5,
      lockDuration: 60_000,
    },
  );

  _worker.on("failed", (job, err) => {
    console.error(
      `[worker] Job ${job?.id} exhausted all retries:`,
      err.message,
    );
  });

  _worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} acknowledged`);
  });

  return _worker;
}

export function getWorker(): Worker {
  if (!_worker) {
    throw new Error("Worker not initialized. Call createWorker() first.");
  }
  return _worker;
}
