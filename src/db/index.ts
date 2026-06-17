import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { Config } from "../config/types.ts";
import * as schema from "./schema/index.ts";

let _db: ReturnType<typeof drizzle> | null = null;

export function createDb(config: Config) {
  const client = postgres({
    host: config.postgres.host,
    port: config.postgres.port,
    database: config.postgres.database,
    user: config.postgres.user,
    password: config.postgres.password,
    max: 10,
  });

  _db = drizzle(client, { schema });
  return _db;
}

export function getDb() {
  if (!_db) {
    throw new Error("Database not initialized. Call createDb() first.");
  }
  return _db;
}
