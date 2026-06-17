import logging

from openai import AsyncOpenAI

from bot.providers import LLMProvider

logger = logging.getLogger("bot.providers.openai")

BASE_URLS = {
    "openrouter": "https://openrouter.ai/api/v1",
    "chatgpt": "https://api.openai.com/v1",
    "grok": "https://api.x.ai/v1",
    "deepseek": "https://api.deepseek.com/v1",
    "mistral": "https://api.mistral.ai/v1",
    "groq": "https://api.groq.com/openai/v1",
    "together": "https://api.together.xyz/v1",
    "perplexity": "https://api.perplexity.ai",
    "fireworks": "https://api.fireworks.ai/inference/v1",
    "deepinfra": "https://api.deepinfra.com/v1/openai",
    "ollama": "http://localhost:11434/v1",
    "lmstudio": "http://localhost:1234/v1",
}


class OpenAICompatProvider(LLMProvider):
    def __init__(self, model: str, token: str, api_type: str = "chatgpt", **kwargs) -> None:
        self.model = model
        base_url = BASE_URLS.get(api_type, BASE_URLS["chatgpt"])
        self.client = AsyncOpenAI(base_url=base_url, api_key=token)

    async def generate(self, messages: list[dict[str, str]], **kwargs) -> str | None:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=kwargs.get("max_tokens", 500),
        )
        return response.choices[0].message.content
