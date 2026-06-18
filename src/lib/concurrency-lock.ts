import { getRedis } from "./redis.ts";
import { acquireLockInMemory, releaseLockInMemory } from "./memory-store.ts";

const KEY_PREFIX = "lock:channel";
const LOCK_TTL_SEC = 300;

export async function acquireLock(
  channelId: string,
  userId: string,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return acquireLockInMemory(channelId, userId);

  const key = `${KEY_PREFIX}:${channelId}:user:${userId}`;
  const result = await redis.set(key, "1", "EX", LOCK_TTL_SEC, "NX");
  return result === "OK";
}

export async function releaseLock(
  channelId: string,
  userId: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    releaseLockInMemory(channelId, userId);
    return;
  }

  const key = `${KEY_PREFIX}:${channelId}:user:${userId}`;
  await redis.del(key);
}
