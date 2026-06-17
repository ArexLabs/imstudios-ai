import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { configSchema, type Config } from "./types.ts";

let _config: Config | null = null;

export function loadConfig(path = "config.yaml"): Config {
  const raw = readFileSync(path, "utf-8");
  const parsed = yaml.load(raw);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("config.yaml is empty or invalid");
  }

  const config = configSchema.parse(parsed);
  _config = config;
  return config;
}

export function getConfig(): Config {
  if (!_config) {
    throw new Error("Config not loaded. Call loadConfig() first.");
  }
  return _config;
}
