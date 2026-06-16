from dataclasses import dataclass, field
from pathlib import Path

import yaml

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = PROJECT_ROOT / "config.yaml"


class ConfigError(Exception):
    pass


@dataclass
class ProviderConfig:
    name: str
    max_tokens: int = 500
    system_prompt: str = "Du bist ein hilfreicher Discord-Assistent. Antworte kurz auf Deutsch."
    model: str = ""
    token: str = ""
    api_type: str = ""


@dataclass
class Config:
    discord_token: str = ""
    target_channel_id: int = 0
    message_content_intent: bool = True
    provider: ProviderConfig = field(default_factory=ProviderConfig)

    @classmethod
    def load(cls) -> "Config":
        raw = yaml.safe_load(CONFIG_PATH.read_text())

        discord_cfg = raw.get("discord", {})
        prov_cfg = raw.get("provider", {})
        name = prov_cfg.get("name", "huggingface")
        specific = prov_cfg.get(name, {})

        return cls(
            discord_token=str(discord_cfg.get("token", "")),
            target_channel_id=int(discord_cfg.get("target_channel_id", "0")),
            message_content_intent=bool(discord_cfg.get("message_content_intent", True)),
            provider=ProviderConfig(
                name=name,
                max_tokens=int(prov_cfg.get("max_tokens", 500)),
                system_prompt=str(prov_cfg.get("system_prompt", "")),
                model=str(specific.get("model", "")),
                token=str(specific.get("token", "")),
                api_type=name,
            ),
        )

    def validate(self) -> "Config":
        missing = []
        if not self.discord_token or "YOUR_" in self.discord_token:
            missing.append("discord.token")
        if self.target_channel_id == 0:
            missing.append("discord.target_channel_id")
        if not self.provider.token or "YOUR_" in self.provider.token:
            missing.append(f"provider.{self.provider.name}.token")
        if not self.provider.model:
            missing.append(f"provider.{self.provider.name}.model")
        if missing:
            raise ConfigError(
                f"Missing required config: {', '.join(missing)}"
            )
        return self
