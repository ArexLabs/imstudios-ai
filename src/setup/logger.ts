import { sendChunkedMessage } from "../lib/discord-rest.ts";

const consoleLog = console.log.bind(console);
const consoleWarn = console.warn.bind(console);
const consoleError = console.error.bind(console);

type LogEntry = {
  level: "log" | "warn" | "error";
  args: unknown[];
  timestamp: Date;
};

const channelMap = new Map<string, string>();

let buffer: LogEntry[] = [];
let flushing = false;

export function setLogChannel(guildId: string, channelId: string) {
  channelMap.set(guildId, channelId);
}

export function removeLogChannel(guildId: string) {
  channelMap.delete(guildId);
}

export function getLogChannelIds(): string[] {
  return [...new Set(channelMap.values())];
}

function formatEntry(entry: LogEntry): string {
  const time = entry.timestamp.toISOString().slice(11, 19);
  const label = entry.level === "error" ? "ERROR" : entry.level === "warn" ? "WARN" : "INFO";
  const text = entry.args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  return `[${time}] [${label}] ${text}`;
}

function sanitize(text: string): string {
  return text.replace(/```/g, "'''").slice(0, 1900);
}

async function flushBuffer() {
  if (flushing || buffer.length === 0) return;
  flushing = true;

  const entries = buffer.splice(0);
  buffer = [];

  const channelIds = getLogChannelIds();
  if (channelIds.length === 0) {
    flushing = false;
    return;
  }

  const blocks: string[] = [];
  let block = "";

  for (const entry of entries) {
    const line = formatEntry(entry);
    if (block.length + line.length + 4 > 1900) {
      blocks.push(block);
      block = line;
    } else {
      block = block ? `${block}\n${line}` : line;
    }
  }
  if (block) blocks.push(block);

  for (const channelId of channelIds) {
    for (const text of blocks) {
      try {
        await sendChunkedMessage(channelId, `\`\`\`\n${sanitize(text)}\n\`\`\``);
      } catch {}
    }
  }

  flushing = false;
}

setInterval(flushBuffer, 2000);

export function initLogger() {
  console.log = (...args: unknown[]) => {
    consoleLog(...args);
    buffer.push({ level: "log", args, timestamp: new Date() });
  };

  console.warn = (...args: unknown[]) => {
    consoleWarn(...args);
    buffer.push({ level: "warn", args, timestamp: new Date() });
  };

  console.error = (...args: unknown[]) => {
    consoleError(...args);
    buffer.push({ level: "error", args, timestamp: new Date() });
  };
}
