import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { Config } from "../config/types.ts";
import * as schema from "./schema/index.ts";

let _db: ReturnType<typeof drizzle> | null = null;

export function createDb(config: Config): ReturnType<typeof drizzle> | null {
  if (!config.postgres) {
    console.log("[db] No Postgres config provided — DB features disabled");
    return null;
  }

  const pgOptions = config.postgres.url
    ? { url: config.postgres.url, max: 10 }
    : {
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        max: 10,
      };
  const client = postgres(pgOptions);

  _db = drizzle(client, { schema });
  return _db;
}

export function getDb(): ReturnType<typeof drizzle> | null {
  return _db;
}
