import { updateGuildSettings } from "./settings.ts";
import { setLogChannel } from "./logger.ts";
import type { GuildSettings } from "./types.ts";

type Option = {
  name: string;
  value: unknown;
  options?: Option[];
};

function findOption(options: Option[] | undefined, name: string): Option | undefined {
  return options?.find((o) => o.name === name);
}

function findSubCommand(options: Option[] | undefined): { name: string; options: Option[] } | null {
  if (!options?.length) return null;
  const first = options[0];
  return { name: first.name, options: first.options ?? [] };
}

async function respond(bot: any, interaction: any, content: string) {
  try {
    await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: 4,
      data: { content },
    });
  } catch (e) {
    console.error("[setup] Failed to respond to interaction:", e);
  }
}

export async function handleSetup(bot: any, interaction: any): Promise<void> {
  const guildId = interaction.guildId as string | undefined;
  if (!guildId) {
    await respond(bot, interaction, "This command can only be used in a server.");
    return;
  }

  const sub = findSubCommand(interaction.data?.options);
  if (!sub) {
    await respond(bot, interaction, "Missing subcommand.");
    return;
  }

  switch (sub.name) {
    case "logs":
      await handleLogs(bot, interaction, guildId, sub.options);
      break;
    case "ai":
      await handleAi(bot, interaction, guildId, sub.options);
      break;
    default:
      await respond(bot, interaction, `Unknown subcommand: ${sub.name}`);
  }
}

async function handleLogs(
  bot: any,
  interaction: any,
  guildId: string,
  options: Option[],
) {
  const channelOpt = findOption(options, "channel");
  if (!channelOpt) {
    await respond(bot, interaction, "Missing channel option.");
    return;
  }

  const channelId = String(channelOpt.value);
  await updateGuildSettings(guildId, { logChannelId: channelId });
  setLogChannel(guildId, channelId);

  await respond(
    bot,
    interaction,
    `<#${channelId}> has been set as the log channel. Logs will appear here every few seconds.`,
  );
}

async function handleAi(
  bot: any,
  interaction: any,
  guildId: string,
  options: Option[],
) {
  const sub = findSubCommand(options);
  if (!sub) {
    await respond(bot, interaction, "Missing ai subcommand (provider or channel).");
    return;
  }

  switch (sub.name) {
    case "provider":
      await handleAiProvider(bot, interaction, guildId, sub.options);
      break;
    case "channel":
      await handleAiChannel(bot, interaction, guildId, sub.options);
      break;
    default:
      await respond(bot, interaction, `Unknown ai subcommand: ${sub.name}`);
  }
}

async function handleAiProvider(
  bot: any,
  interaction: any,
  guildId: string,
  options: Option[],
) {
  const typeOpt = findOption(options, "type");
  const keyOpt = findOption(options, "key");
  const modelOpt = findOption(options, "model");
  const baseUrlOpt = findOption(options, "base_url");

  if (!typeOpt || !keyOpt) {
    await respond(bot, interaction, "Usage: `/setup ai provider <type> <key> [model] [base_url]`");
    return;
  }

  const type = String(typeOpt.value).toLowerCase();
  const key = String(keyOpt.value);
  const model = modelOpt ? String(modelOpt.value) : undefined;
  const baseUrl = baseUrlOpt ? String(baseUrlOpt.value) : undefined;

  const provider: GuildSettings["provider"] = { name: type, token: key };
  if (model) provider.model = model;
  if (baseUrl) provider.baseUrl = baseUrl;

  await updateGuildSettings(guildId, { provider });

  await respond(
    bot,
    interaction,
    `AI provider set to **${type}**${model ? ` (${model})` : ""}. This will be used for all AI responses in this server.`,
  );
}

async function handleAiChannel(
  bot: any,
  interaction: any,
  guildId: string,
  options: Option[],
) {
  const channelOpt = findOption(options, "channel");
  if (!channelOpt) {
    await respond(bot, interaction, "Missing channel option.");
    return;
  }

  const channelId = String(channelOpt.value);
  await updateGuildSettings(guildId, { aiChannelId: channelId });

  await respond(
    bot,
    interaction,
    `<#${channelId}> has been set as the AI response channel. The bot will only respond to messages in that channel.`,
  );
}

const SETUP_COMMAND = {
  name: "setup",
  description: "Configure bot settings",
  options: [
    {
      name: "logs",
      description: "Set the channel for bot logs",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Channel to forward logs to",
          type: 7,
          required: true,
        },
      ],
    },
    {
      name: "ai",
      description: "AI provider or channel configuration",
      type: 2,
      options: [
        {
          name: "provider",
          description: "Configure an AI provider for this server",
          type: 1,
          options: [
            {
              name: "type",
              description: "Provider type (e.g. openrouter, openai, anthropic, gemini, huggingface)",
              type: 3,
              required: true,
            },
            {
              name: "key",
              description: "API key for the provider",
              type: 3,
              required: true,
            },
            {
              name: "model",
              description: "Model name (default depends on provider)",
              type: 3,
            },
            {
              name: "base_url",
              description: "Custom base URL (optional)",
              type: 3,
            },
          ],
        },
        {
          name: "channel",
          description: "Restrict AI responses to a specific channel",
          type: 1,
          options: [
            {
              name: "channel",
              description: "Channel where the bot should respond",
              type: 7,
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

export async function registerSetupCommand(bot: any) {
  try {
    await bot.helpers.upsertGlobalApplicationCommands([SETUP_COMMAND]);
    console.log("[setup] Registered /setup command globally");
  } catch (e) {
    console.error("[setup] Failed to register global command:", e);
  }
}
