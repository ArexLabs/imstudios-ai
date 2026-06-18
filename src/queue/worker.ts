import { Worker } from "bullmq";
import { releaseLock } from "../lib/concurrency-lock.ts";
import { generateResponse } from "../ai/provider.ts";
import { sendChunkedMessage } from "../lib/discord-rest.ts";
import { tryAutoTitle } from "../lib/auto-title.ts";
import { searchWeb, formatSearchResults } from "../lib/search.ts";
import type { AiProcessingJobData } from "./types.ts";
import type { Config } from "../config/types.ts";

const QUEUE_NAME = "ai-processing";

export type AiMessageHandler = (
  data: AiProcessingJobData,
  config: Config,
) => Promise<string>;

let _worker: Worker | null = null;

export async function aiHandler(
  data: AiProcessingJobData,
  config: Config,
): Promise<string> {
  const { channelId, content } = data;

  let systemPrompt = config.ai.systemPrompt;

  if (config.search?.enabled) {
    try {
      const results = await searchWeb(content, config.search);
      const context = formatSearchResults(content, results);
      if (context) {
        systemPrompt = `${systemPrompt}\n\n${context}`;
        console.log(
          `[worker] Augmented with ${results.length} web search results`,
        );
      }
    } catch (e) {
      console.error("[worker] Web search error:", e);
    }
  }

  const providersOverride = data.providerOverride
    ? [
        {
          name: data.providerOverride.name,
          token: data.providerOverride.token,
          model: data.providerOverride.model ?? config.providers[0]?.model ?? "",
          baseUrl: data.providerOverride.baseUrl,
        },
      ]
    : undefined;

  const { text, provider } = await generateResponse(
    {
      systemPrompt,
      messages: [{ role: "user", content }],
      maxTokens: config.ai.maxTokens,
    },
    config,
    undefined,
    providersOverride,
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
): Worker | null {
  if (!config.redis) {
    console.log("[worker] No Redis — BullMQ worker disabled, processing inline");
    return null;
  }

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

        await releaseLock(channelId, authorId);

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

export function getWorker(): Worker | null {
  return _worker;
}
