import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getDb } from "../db/index.ts";
import { threads } from "../db/schema/index.ts";
import { eq } from "drizzle-orm";
import type { Config, ProviderConfig } from "../config/types.ts";
import type { AiRequest, AiResponse } from "./types.ts";

const FALLBACK_MESSAGE =
  "⚠️ The AI service is currently unavailable. Please try again later.";

function createProviderInstance(
  provider: ProviderConfig,
):
  | ReturnType<typeof createOpenAI>
  | ReturnType<typeof createAnthropic>
  | ReturnType<typeof createGoogleGenerativeAI>
  | null {
  const { name, token, baseUrl } = provider;

  switch (name) {
    case "anthropic":
      return createAnthropic({ apiKey: token });
    case "gemini":
      return createGoogleGenerativeAI({ apiKey: token });
    default:
      return createOpenAI({ apiKey: token, baseURL: baseUrl });
  }
}

function getModel(
  provider: ProviderConfig,
  instance:
    | ReturnType<typeof createOpenAI>
    | ReturnType<typeof createAnthropic>
    | ReturnType<typeof createGoogleGenerativeAI>,
) {
  const { name, model } = provider;

  switch (name) {
    case "anthropic":
      return (instance as ReturnType<typeof createAnthropic>)(model);
    case "gemini":
      return (instance as ReturnType<typeof createGoogleGenerativeAI>)(model);
    default:
      return (instance as ReturnType<typeof createOpenAI>)(model);
  }
}

async function tryProvider(
  request: AiRequest,
  provider: ProviderConfig,
): Promise<string | null> {
  const instance = createProviderInstance(provider);
  if (!instance) return null;

  try {
    const result = await generateText({
      model: getModel(provider, instance),
      system: request.systemPrompt,
      messages: request.messages,
      maxRetries: 0,
      maxTokens: request.maxTokens,
    });

    return result.text;
  } catch (error) {
    console.error(
      `[ai] Provider "${provider.name}" (${provider.model}) failed:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function lockThread(threadId?: string): Promise<void> {
  if (!threadId) return;

  const db = getDb();
  if (!db) return;

  try {
    await db
      .update(threads)
      .set({
        isLocked: true,
        lockReason: "All AI providers exhausted",
        updatedAt: new Date(),
      })
      .where(eq(threads.id, BigInt(threadId)));
    console.warn(`[ai] Thread ${threadId} locked (kill-switch tripped)`);
  } catch (dbErr) {
    console.error(`[ai] Failed to lock thread ${threadId}:`, dbErr);
  }
}

export async function generateResponse(
  request: AiRequest,
  config: Config,
  threadId?: string,
): Promise<AiResponse> {
  for (const provider of config.providers) {
    const text = await tryProvider(request, provider);
    if (text !== null) {
      return { text, provider: provider.name };
    }
  }

  console.error("[ai] All providers failed — tripping kill-switch");

  await lockThread(threadId);

  return { text: FALLBACK_MESSAGE, provider: "fallback" };
}
