import logging

import discord

from bot.config import Config
from bot.providers import LLMProvider, build_provider

logger = logging.getLogger("bot")


class DiscordBot:
    def __init__(self, config: Config) -> None:
        self.config = config.validate()
        self.provider: LLMProvider = build_provider(config.provider)

        intents = discord.Intents.default()
        intents.message_content = self.config.message_content_intent
        self.client = discord.Client(intents=intents)

        self._register_events()

    def _register_events(self) -> None:
        self.client.event(self.on_ready)
        self.client.event(self.on_message)

    async def on_ready(self) -> None:
        logger.info("Bot logged in as %s | Provider: %s", self.client.user, self.config.provider.name)

    async def on_message(self, message: discord.Message) -> None:
        if message.author == self.client.user:
            return

        if message.channel.id != self.config.target_channel_id:
            return

        is_mentioned = self.client.user in message.mentions
        if not self.config.message_content_intent and not is_mentioned:
            return

        async with message.channel.typing():
            try:
                content = message.content
                if is_mentioned:
                    # Clean up bot mention from the message text
                    mention = self.client.user.mention
                    content = content.replace(mention, "").strip()
                    nickname_mention = mention.replace("<@", "<@!")
                    content = content.replace(nickname_mention, "").strip()

                if not content:
                    await message.reply("Bitte stelle mir eine Frage.")
                    return

                reply = await self._query_llm(content)
                await message.reply(reply if reply else "Konnte keine Antwort generieren.")
            except Exception:
                logger.exception("Fehler bei der LLM Anfrage (%s)", self.config.provider.name)
                await message.reply("Fehler bei der Verarbeitung der Anfrage.")

    async def _query_llm(self, user_message: str) -> str | None:
        messages = [
            {"role": "system", "content": self.config.provider.system_prompt},
            {"role": "user", "content": user_message},
        ]
        return await self.provider.generate(
            messages=messages,
            max_tokens=self.config.provider.max_tokens,
        )

    def run(self) -> None:
        self.client.run(self.config.discord_token, log_handler=None)
