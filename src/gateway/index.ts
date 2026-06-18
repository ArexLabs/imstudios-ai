import { createBot, Intents } from "discordeno";
import type { Config } from "../config/types.ts";
import { publishMessage } from "../queue/publisher.ts";
import type { PublishResult } from "../queue/publisher.ts";

export async function startGateway(config: Config): Promise<void> {
  const bot = createBot({
    token: config.discord.token,
    intents:
      Intents.Guilds |
      Intents.GuildMessages |
      Intents.MessageContent |
      Intents.DirectMessages,
    desiredProperties: {
      message: {
        author: true,
        channelId: true,
        guildId: true,
        content: true,
        webhookId: true,
      },
      user: {
        id: true,
        toggles: true,
      },
    },
    events: {
      async messageCreate(message) {
        if (message.webhookId) return;
        if (message.author?.bot) return;
        if (message.author?.id === bot.id) return;

        const guildId = message.guildId
          ? String(message.guildId)
          : undefined;
        const channelId = message.channelId
          ? String(message.channelId)
          : undefined;
        const authorId = message.author?.id
          ? String(message.author.id)
          : undefined;
        const content = message.content ?? undefined;

        if (!content || !guildId || !channelId || !authorId) return;

        console.log(
          `[gateway] messageCreate | author=${authorId} channel=${channelId}`,
        );

        if (config.features.autoReply) {
          await bot.helpers.triggerTypingIndicator(channelId).catch((e) =>
            console.warn("[gateway] typing indicator failed:", e),
          );

          const result: PublishResult = await publishMessage(
            { guildId, channelId, authorId, content },
            config,
          );

          if (!result.accepted) {
            console.log(
              `[gateway] Message from ${authorId} rejected: ${result.reason}`,
            );
          }
        }
      },
    },
  });

  await bot.start();
  console.log("[gateway] Discord gateway connected");
}
