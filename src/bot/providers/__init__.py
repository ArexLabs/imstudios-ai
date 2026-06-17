from abc import ABC, abstractmethod

from bot.config import ProviderConfig


class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[dict[str, str]], **kwargs) -> str | None:
        ...


def build_provider(cfg: ProviderConfig) -> LLMProvider:
    match cfg.name:
        case "huggingface":
            from bot.providers.huggingface import HuggingFaceProvider
            return HuggingFaceProvider(model=cfg.model, token=cfg.token)
        case "openrouter" | "chatgpt" | "grok" | "deepseek" | "mistral" | "groq" | "together" | "perplexity" | "fireworks" | "deepinfra" | "ollama" | "lmstudio":
            from bot.providers.openai_compat import OpenAICompatProvider
            return OpenAICompatProvider(
                model=cfg.model, token=cfg.token, api_type=cfg.name,
            )
        case "claude":
            from bot.providers.anthropic import AnthropicProvider
            return AnthropicProvider(model=cfg.model, token=cfg.token)
        case "gemini":
            from bot.providers.google import GeminiProvider
            return GeminiProvider(model=cfg.model, token=cfg.token)
        case _:
            raise ValueError(f"Unknown provider: {cfg.name}")
