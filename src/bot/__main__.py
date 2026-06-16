import logging

from bot.config import Config, ConfigError
from bot.main import DiscordBot

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def main() -> None:
    try:
        config = Config.load()
        bot = DiscordBot(config)
        bot.run()
    except ConfigError as e:
        logging.error("Config error: %s", e)
        raise SystemExit(1) from e
    except Exception as e:
        logging.exception("Unexpected error")
        raise SystemExit(1) from e


if __name__ == "__main__":
    main()
