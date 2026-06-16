import logging

from anthropic import AsyncAnthropic

from bot.providers import LLMProvider

logger = logging.getLogger("bot.providers.anthropic")


class AnthropicProvider(LLMProvider):
    def __init__(self, model: str, token: str, **kwargs) -> None:
        self.model = model
        self.client = AsyncAnthropic(api_key=token)

    async def generate(self, messages: list[dict[str, str]], **kwargs) -> str | None:
        system = None
        filtered = messages
        if messages and messages[0]["role"] == "system":
            system = messages[0]["content"]
            filtered = messages[1:]

        response = await self.client.messages.create(
            model=self.model,
            system=system,
            messages=filtered,
            max_tokens=kwargs.get("max_tokens", 500),
        )
        return response.content[0].text
