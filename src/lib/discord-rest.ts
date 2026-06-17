import { createRestManager } from "discordeno";
import { chunkMessage } from "./message-chunker.ts";
import type { CreateMessageOptions } from "@discordeno/types";

let _rest: ReturnType<typeof createRestManager> | null = null;

export function createRestClient(token: string) {
  _rest = createRestManager({ token });
  return _rest;
}

export function getRest() {
  if (!_rest) {
    throw new Error("REST client not initialized. Call createRestClient() first.");
  }
  return _rest;
}

export async function sendChunkedMessage(
  channelId: string,
  text: string,
): Promise<void> {
  const rest = getRest();
  const chunks = chunkMessage(text);

  for (const chunk of chunks) {
    await rest.sendMessage(channelId, { content: chunk } as CreateMessageOptions);
  }
}
