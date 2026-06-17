import { Cron } from "croner";
import { and, lt, isNull, asc, eq, or } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { threads, messages } from "../db/schema/index.ts";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { Config } from "../config/types.ts";

const SUMMARY_PROMPT = `Summarize the following Discord conversation thread concisely in German. Focus on the technical problem being discussed, solutions proposed, and any decisions made. Keep the summary under 400 characters.`;

interface ThreadWithMessages {
  threadId: bigint;
  title: string;
  recentMessages: Array<{ role: "user" | "assistant"; content: string }>;
}

async function fetchThreadsForSummary(config: Config): Promise<ThreadWithMessages[]> {
  const db = getDb();
  const cutoff = new Date(
    Date.now() - config.ai.summary.maxContextMessages * 60_000,
  );
  const maxMsgs = config.ai.summary.maxContextMessages;

  const staleThreads = await db
    .select({
      id: threads.id,
      title: threads.title,
    })
    .from(threads)
    .where(
      and(
        eq(threads.isLocked, false),
        // Either never summarized, or last summary was > interval minutes ago
        or(
          isNull(threads.lastSummaryAt),
          lt(
            threads.lastSummaryAt,
            new Date(Date.now() - config.ai.summary.intervalMinutes * 60_000),
          ),
        ),
      ),
    )
    .limit(20);

  const result: ThreadWithMessages[] = [];

  for (const t of staleThreads) {
    const msgs = await db
      .select({
        content: messages.content,
        isAiResponse: messages.isAiResponse,
      })
      .from(messages)
      .where(
        and(
          eq(messages.threadId, t.id),
          lt(messages.createdAt, cutoff),
        ),
      )
      .orderBy(asc(messages.createdAt))
      .limit(maxMsgs);

    if (msgs.length < 3) continue;

    result.push({
      threadId: t.id,
      title: t.title,
      recentMessages: msgs.map((m) => ({
        role: m.isAiResponse ? "assistant" as const : "user" as const,
        content: m.content,
      })),
    });
  }

  return result;
}

async function summarizeThread(
  entry: ThreadWithMessages,
  config: Config,
): Promise<string | null> {
  const primary = config.providers[0];
  if (!primary) return null;

  const openai = createOpenAI({ apiKey: primary.token, baseURL: primary.baseUrl });

  try {
    const result = await generateText({
      model: openai(primary.model),
      system: SUMMARY_PROMPT,
      messages: [
        {
          role: "user",
          content: `Thread title: "${entry.title}"\n\nMessages:\n${entry.recentMessages.map((m) => `[${m.role}]: ${m.content}`).join("\n")}`,
        },
      ],
      maxTokens: 300,
    });

    return result.text;
  } catch (error) {
    console.error("[summary] Failed to generate summary:", error);
    return null;
  }
}

async function storeSummary(threadId: bigint, summary: string): Promise<void> {
  const db = getDb();
  await db
    .update(threads)
    .set({
      summary,
      lastSummaryAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(threads.id, threadId));
}

export function startSummaryCron(config: Config): Cron {
  const interval = `*/${config.ai.summary.intervalMinutes} * * * *`;

  const job = new Cron(interval, async () => {
    console.log("[summary] Cron tick — sweeping threads for summarization");

    try {
      const entries = await fetchThreadsForSummary(config);
      console.log(`[summary] Found ${entries.length} threads to summarize`);

      for (const entry of entries) {
        const summary = await summarizeThread(entry, config);
        if (summary) {
          await storeSummary(entry.threadId, summary);
          console.log(
            `[summary] Thread ${entry.threadId} summarized (${summary.length} chars)`,
          );
        }
      }
    } catch (error) {
      console.error("[summary] Cron error:", error);
    }
  });

  console.log(
    `[summary] Cron scheduled every ${config.ai.summary.intervalMinutes} minute(s)`,
  );
  return job;
}


