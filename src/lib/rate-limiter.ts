import { getRedis } from "./redis.ts";

const WINDOW_MS = 60_000;
const KEY_PREFIX = "ratelimit:user";

export async function checkRateLimit(
  userId: string,
  maxPerMinute: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const key = `${KEY_PREFIX}:${userId}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  await redis.zremrangebyscore(key, 0, windowStart);

  const count = await redis.zcard(key);

  if (count >= maxPerMinute) {
    return { allowed: false, remaining: 0 };
  }

  await redis.zadd(key, now, `${now}:${crypto.randomUUID()}`);
  await redis.expire(key, 60);

  return { allowed: true, remaining: maxPerMinute - count - 1 };
}
