import logging

from huggingface_hub import InferenceClient

from bot.providers import LLMProvider

logger = logging.getLogger("bot.providers.huggingface")


class HuggingFaceProvider(LLMProvider):
    def __init__(self, model: str, token: str, **kwargs) -> None:
        self.model = model
        self.client = InferenceClient(model=model, token=token)

    async def generate(self, messages: list[dict[str, str]], **kwargs) -> str | None:
        response = await self.client.chat_completion_async(
            messages=messages,
            max_tokens=kwargs.get("max_tokens", 500),
        )
        return response.choices[0].message.content
