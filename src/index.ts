import { loadConfig } from "./config/loader.ts";
import { createDb } from "./db/index.ts";

function main() {
  console.log("[boot] Loading config...");
  const config = loadConfig();
  console.log(`[boot] Config loaded. ${config.providers.length} AI provider(s) configured.`);

  console.log("[boot] Connecting to Postgres...");
  const db = createDb(config);
  // Force a connection check
  db.execute("SELECT 1").then(() => {
    console.log("[boot] Postgres connection OK");
  });

  console.log("[boot] Phase 1 scaffold ready.");
  console.log(`[boot] Discord: token=${config.discord.token.slice(0, 8)}...`);
  console.log(`[boot] Redis: ${config.redis.host}:${config.redis.port}`);
  console.log(`[boot] Postgres: ${config.postgres.host}:${config.postgres.port}/${config.postgres.database}`);
}

main();
