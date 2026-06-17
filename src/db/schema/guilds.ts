import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const guilds = pgTable("guilds", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  aiEnabled: boolean("ai_enabled").notNull().default(true),
  settings: text("settings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
