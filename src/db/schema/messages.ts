import {
  bigint,
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { threads } from "./threads.ts";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: bigint("thread_id", { mode: "bigint" })
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  authorId: bigint("author_id", { mode: "bigint" }).notNull(),
  content: text("content").notNull(),
  isAiResponse: boolean("is_ai_response").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
