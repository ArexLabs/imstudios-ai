import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { configSchema, type Config } from "./types.ts";

let _config: Config | null = null;

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

export function loadConfig(path = "config.yaml"): Config {
  const raw = readFileSync(path, "utf-8");
  const parsed = yaml.load(raw);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("config.yaml is empty or invalid");
  }

  const normalized = transformKeys(parsed);
  const config = configSchema.parse(normalized);
  _config = config;
  return config;
}

export function getConfig(): Config {
  if (!_config) {
    throw new Error("Config not loaded. Call loadConfig() first.");
  }
  return _config;
}
