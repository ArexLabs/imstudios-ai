FROM ghcr.io/astral-sh/uv:python3.11-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY src/ src/

RUN uv sync --frozen --no-dev

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["uv", "run", "bot"]
