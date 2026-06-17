import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { guilds } from "./guilds.ts";

export const threads = pgTable("threads", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  guildId: bigint("guild_id", { mode: "bigint" })
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 256 }).notNull().default(""),
  summary: text("summary"),
  isLocked: boolean("is_locked").notNull().default(false),
  lockReason: varchar("lock_reason", { length: 512 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastSummaryAt: timestamp("last_summary_at"),
});
