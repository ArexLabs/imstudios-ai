import { getDb } from "../db/index.ts";
import { guilds } from "../db/schema/index.ts";
import { eq } from "drizzle-orm";
import type { GuildSettings } from "./types.ts";

const memoryStore = new Map<string, GuildSettings>();

export async function getGuildSettings(guildId: string): Promise<GuildSettings> {
  const cached = memoryStore.get(guildId);
  if (cached) return cached;

  const db = getDb();
  if (!db) return {};

  const [row] = await db
    .select({ settings: guilds.settings })
    .from(guilds)
    .where(eq(guilds.id, BigInt(guildId)))
    .limit(1);

  if (row?.settings) {
    try {
      const parsed = JSON.parse(row.settings) as GuildSettings;
      memoryStore.set(guildId, parsed);
      return parsed;
    } catch {}
  }

  return {};
}

export async function updateGuildSettings(
  guildId: string,
  update: Partial<GuildSettings>,
): Promise<GuildSettings> {
  const current = await getGuildSettings(guildId);
  const next = { ...current, ...update };

  memoryStore.set(guildId, next);

  const db = getDb();
  if (!db) return next;

  const payload = JSON.stringify(next);
  const id = BigInt(guildId);

  const [existing] = await db
    .select({ id: guilds.id })
    .from(guilds)
    .where(eq(guilds.id, id))
    .limit(1);

  if (existing) {
    await db
      .update(guilds)
      .set({ settings: payload, updatedAt: new Date() })
      .where(eq(guilds.id, id));
  } else {
    await db.insert(guilds).values({
      id,
      name: "",
      settings: payload,
    });
  }

  return next;
}
