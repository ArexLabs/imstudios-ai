import { getDb } from "../db/index.ts";
import { threads, messages } from "../db/schema/index.ts";
import { eq, count, asc } from "drizzle-orm";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getRest } from "./discord-rest.ts";
import type { Config } from "../config/types.ts";

const TITLE_PROMPT = `Generate a concise, descriptive title (max 80 characters) for this technical support forum thread based on the conversation. The title should summarize the core technical issue being discussed. Respond with ONLY the title text, no quotes or formatting.`;

export async function tryAutoTitle(
  channelId: string,
  config: Config,
): Promise<void> {
  if (!config.features.autoTitle) return;

  const db = getDb();
  if (!db) return;

  const threadId = BigInt(channelId);

  const [thread] = await db
    .select({ title: threads.title })
    .from(threads)
    .where(eq(threads.id, threadId))
    .limit(1);

  if (!thread || thread.title) return;

  const [msgCount] = await db
    .select({ count: count() })
    .from(messages)
    .where(eq(messages.threadId, threadId));

  if (!msgCount || msgCount.count < config.ai.autoTitle.minMessages) return;

  const recentMsgs = await db
    .select({
      content: messages.content,
      isAiResponse: messages.isAiResponse,
    })
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt))
    .limit(20);

  const primary = config.providers[0];
  if (!primary) return;

  const openai = createOpenAI({ apiKey: primary.token, baseURL: primary.baseUrl });

  let title: string;
  try {
    const result = await generateText({
      model: openai(primary.model),
      system: TITLE_PROMPT,
      messages: [
        {
          role: "user",
          content: recentMsgs
            .map((m) => `[${m.isAiResponse ? "assistant" : "user"}]: ${m.content}`)
            .join("\n"),
        },
      ],
      maxTokens: 100,
    });

    title = result.text.trim().slice(0, 100);
  } catch (error) {
    console.error("[auto-title] AI generation failed:", error);
    return;
  }

  try {
    const rest = getRest();
    await rest.editChannel(channelId, { name: title });
  } catch (error) {
    console.error("[auto-title] Failed to update channel name:", error);
    return;
  }

  try {
    await db
      .update(threads)
      .set({ title, updatedAt: new Date() })
      .where(eq(threads.id, threadId));
    console.log(`[auto-title] Thread ${channelId} titled: "${title}"`);
  } catch (error) {
    console.error("[auto-title] Failed to save title to DB:", error);
  }
}
