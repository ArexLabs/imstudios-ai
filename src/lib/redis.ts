import Redis from "ioredis";
import type { Config } from "../config/types.ts";

let _redis: Redis | null = null;
let _redisReady = false;

export function createRedis(config: Config): Redis | null {
  if (!config.redis) {
    console.log("[redis] No Redis config provided — using in-memory fallback");
    return null;
  }

  const r = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    connectTimeout: 10_000,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  r.on("connect", () => console.log("[redis] Connected"));
  r.on("ready", () => {
    _redisReady = true;
    console.log("[redis] Ready");
  });
  r.on("error", (err) => console.error("[redis] Error:", err));
  r.on("close", () => {
    _redisReady = false;
  });

  r.connect().catch((err) => {
    console.warn("[redis] Initial connection failed:", err.message);
  });

  _redis = r;
  return r;
}

export async function waitForRedis(
  timeoutMs = 15_000,
): Promise<boolean> {
  if (!_redis) return false;
  if (_redisReady) return true;

  try {
    await Promise.race([
      new Promise<void>((resolve) => {
        const check = () => {
          if (_redisReady) resolve();
          else setTimeout(check, 100);
        };
        check();
      }),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), timeoutMs),
      ),
    ]);
    return true;
  } catch {
    console.warn("[redis] Not ready within timeout — using in-memory fallback");
    _redisReady = false;
    return false;
  }
}

export function isRedisReady(): boolean {
  return _redisReady;
}

export function getRedis(): Redis | null {
  return _redisReady ? _redis : null;
}

export function hasRedis(): boolean {
  return _redis !== null && _redisReady;
}
