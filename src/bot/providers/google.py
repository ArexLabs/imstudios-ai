import logging

from google import genai
from google.genai import types

from bot.providers import LLMProvider

logger = logging.getLogger("bot.providers.google")


class GeminiProvider(LLMProvider):
    def __init__(self, model: str, token: str, **kwargs) -> None:
        self.model = model
        self.client = genai.Client(api_key=token)

    async def generate(self, messages: list[dict[str, str]], **kwargs) -> str | None:
        system_prompt = None
        conversation = []
        for msg in messages:
            if msg["role"] == "system":
                system_prompt = msg["content"]
            else:
                role = "user" if msg["role"] == "user" else "model"
                conversation.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=kwargs.get("max_tokens", 500),
        )

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=conversation if conversation else types.Content(role="user", parts=[types.Part.from_text(text="")]),
            config=config,
        )
        return response.text
