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
        const channelId = String(message.channelId);
        const authorId = String(message.author?.id);
        const content = message.content;

        if (!content || !guildId || !channelId || !authorId) return;

        console.log(
          `[gateway] messageCreate | author=${authorId} channel=${channelId}`,
        );

        await bot.helpers.triggerTypingIndicator(channelId).catch(() => {});

        const result: PublishResult = await publishMessage(
          { guildId, channelId, authorId, content },
          config,
        );

        if (!result.accepted) {
          console.log(
            `[gateway] Message from ${authorId} rejected: ${result.reason}`,
          );
        }
      },
    },
  });

  await bot.start();
  console.log("[gateway] Discord gateway connected");
}
