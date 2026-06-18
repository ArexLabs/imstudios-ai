import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";
import { load } from "js-yaml";

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toCamelCase(key)] = transformKeys(value);
    }
    return result;
  }
  return obj;
}

function getDbUrl(): string {
  const envUrl = process.env.POSTGRES_URL;
  if (envUrl) return envUrl;

  try {
    const raw = readFileSync("config.yaml", "utf-8");
    const cfg = transformKeys(load(raw)) as Record<string, any>;
    const pg = cfg?.postgres as Record<string, any> | undefined;
    if (pg?.url) return pg.url;
    if (pg?.host && pg?.port && pg?.database && pg?.user) {
      const pw = pg?.password ? encodeURIComponent(pg.password) : "";
      return `postgres://${pg.user}:${pw}@${pg.host}:${pg.port}/${pg.database}`;
    }
  } catch {}

  throw new Error(
    "Postgres URL not found. Set POSTGRES_URL env, or add postgres.url / postgres.host/port/database/user/password in config.yaml",
  );
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getDbUrl(),
  },
});
