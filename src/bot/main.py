import logging

import discord

from bot.config import Config
from bot.providers import LLMProvider, build_provider
from bot.search import run_search

logger = logging.getLogger("bot")


class DiscordBot:
    def __init__(self, config: Config) -> None:
        self.config = config.validate()
        self.provider: LLMProvider = build_provider(config.provider)

        intents = discord.Intents.default()
        intents.message_content = self.config.message_content_intent
        self.client = discord.Client(intents=intents)

        self.user_memories: dict[int, list[dict[str, str]]] = {}

        self._register_events()

    def _register_events(self) -> None:
        self.client.event(self.on_ready)
        self.client.event(self.on_message)

    async def on_ready(self) -> None:
        logger.info("Bot logged in as %s | Provider: %s", self.client.user, self.config.provider.name)

    async def _get_reply_chain(self, message: discord.Message) -> list[dict[str, str]]:
        chain = []
        current = message
        # Limit the reply history to 10 messages to avoid token issues and API delay
        limit = 10
        while current.reference and len(chain) < limit:
            ref = current.reference
            if ref.cached_message:
                current = ref.cached_message
            elif ref.message_id:
                try:
                    current = await message.channel.fetch_message(ref.message_id)
                except (discord.NotFound, discord.HTTPException, discord.Forbidden):
                    break
            else:
                break

            role = "assistant" if current.author == self.client.user else "user"
            content = current.content
            if self.client.user in current.mentions:
                mention = self.client.user.mention
                content = content.replace(mention, "").strip()
                nickname_mention = mention.replace("<@", "<@!")
                content = content.replace(nickname_mention, "").strip()

            chain.insert(0, {"role": role, "content": content})

        return chain

    def _update_user_memory(self, user_id: int, user_content: str, assistant_content: str) -> None:
        history = self.user_memories.setdefault(user_id, [])
        history.append({"role": "user", "content": user_content})
        history.append({"role": "assistant", "content": assistant_content})
        # Keep last 10 messages (5 user prompts + 5 assistant responses)
        self.user_memories[user_id] = history[-10:]

    async def on_message(self, message: discord.Message) -> None:
        if message.author == self.client.user:
            return

        is_mentioned = self.client.user in message.mentions
        in_target_channel = message.channel.id == self.config.target_channel_id

        # Determine if we should process this message:
        # 1. In target channel: process if intent is enabled, or if bot is mentioned.
        # 2. In any other channel: process ONLY if the bot is mentioned.
        if in_target_channel:
            if not self.config.message_content_intent and not is_mentioned:
                return
        else:
            if not is_mentioned:
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

                # Build conversation history
                if message.reference:
                    # If this is a reply to another message, build context from reply chain
                    history = await self._get_reply_chain(message)
                else:
                    # Otherwise, use user-specific memory
                    history = self.user_memories.get(message.author.id, [])

                # Construct full message list: system prompt + history + current message
                messages = [{"role": "system", "content": self.config.provider.system_prompt}]
                messages.extend(history)
                messages.append({"role": "user", "content": content})

                if self.config.search.enabled:
                    try:
                        search_results = await run_search(
                            query=content,
                            google_key=self.config.search.google_api_key,
                            google_cx=self.config.search.google_cx,
                            bing_key=self.config.search.bing_api_key,
                        )
                        if search_results and "No search results found" not in search_results:
                            messages.insert(0, {
                                "role": "system",
                                "content": f"Here are some web search results that may be relevant:\n\n{search_results}"
                            })
                    except Exception:
                        logger.exception("Web search failed")

                reply = await self._query_llm(messages)
                
                if reply:
                    await message.reply(reply)
                    # Save to user memory ONLY if it wasn't a reply chain
                    if not message.reference:
                        self._update_user_memory(message.author.id, content, reply)
                else:
                    await message.reply("Konnte keine Antwort generieren.")
            except Exception:
                logger.exception("Fehler bei der LLM Anfrage (%s)", self.config.provider.name)
                await message.reply("Fehler bei der Verarbeitung der Anfrage.")

    async def _query_llm(self, messages: list[dict[str, str]]) -> str | None:
        return await self.provider.generate(
            messages=messages,
            max_tokens=self.config.provider.max_tokens,
        )

    def run(self) -> None:
        self.client.run(self.config.discord_token, log_handler=None)
