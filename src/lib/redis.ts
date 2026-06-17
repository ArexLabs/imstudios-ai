import Redis from "ioredis";
import type { Config } from "../config/types.ts";

let _redis: Redis | null = null;

export function createRedis(config: Config): Redis {
  const r = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: null,
  });

  r.on("connect", () => console.log("[redis] Connected"));
  r.on("error", (err) => console.error("[redis] Error:", err));

  _redis = r;
  return r;
}

export function getRedis(): Redis {
  if (!_redis) {
    throw new Error("Redis not initialized. Call createRedis() first.");
  }
  return _redis;
}
