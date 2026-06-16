FROM ghcr.io/astral-sh/uv:python3.11-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY src/ src/

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["uv", "run", "bot"]
