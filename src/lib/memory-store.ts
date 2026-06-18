const WINDOW_MS = 60_000;

const rateLimitMap = new Map<string, number[]>();

const lockMap = new Map<string, ReturnType<typeof setTimeout>>();

export function checkRateLimitInMemory(
  userId: string,
  maxPerMinute: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  let timestamps = rateLimitMap.get(userId) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= maxPerMinute) {
    rateLimitMap.set(userId, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);

  return { allowed: true, remaining: maxPerMinute - timestamps.length };
}

export function acquireLockInMemory(
  channelId: string,
  userId: string,
): boolean {
  const key = `${channelId}:${userId}`;
  if (lockMap.has(key)) return false;

  const timer = setTimeout(() => lockMap.delete(key), 300_000);
  if (timer.unref) timer.unref();
  lockMap.set(key, timer);
  return true;
}

export function releaseLockInMemory(
  channelId: string,
  userId: string,
): void {
  const key = `${channelId}:${userId}`;
  const timer = lockMap.get(key);
  if (timer) {
    clearTimeout(timer);
    lockMap.delete(key);
  }
}
