import { z } from "zod";

const providerSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  token: z.string(),
  baseUrl: z.string().optional(),
});

const rateLimitSchema = z.object({
  maxPerMinute: z.number().int().positive().default(15),
});

const summarySchema = z.object({
  intervalMinutes: z.number().int().positive().default(2),
  maxContextMessages: z.number().int().positive().default(50),
});

const autoTitleSchema = z.object({
  minMessages: z.number().int().positive().default(3),
});

const aiSchema = z.object({
  maxTokens: z.number().int().positive().default(500),
  systemPrompt: z.string().default(""),
  rateLimit: rateLimitSchema.default({}),
  summary: summarySchema.default({}),
  autoTitle: autoTitleSchema.default({}),
});

const discordSchema = z.object({
  token: z.string().min(1),
});

const redisSchema = z.object({
  host: z.string().default("localhost"),
  port: z.number().int().positive().default(6379),
  password: z.string().optional(),
});

const postgresSchema = z.object({
  host: z.string().default("localhost"),
  port: z.number().int().positive().default(5432),
  database: z.string().min(1),
  user: z.string().min(1),
  password: z.string(),
  url: z.string().optional(),
});

const searchSchema = z.object({
  enabled: z.boolean().default(false),
  googleApiKey: z.string().optional(),
  googleCx: z.string().optional(),
  bingApiKey: z.string().optional(),
});

const featuresSchema = z.object({
  autoReply: z.boolean().default(true),
  autoTitle: z.boolean().default(true),
  summarization: z.boolean().default(true),
  rateLimiting: z.boolean().default(true),
  concurrencyLock: z.boolean().default(true),
});

export const configSchema = z.object({
  discord: discordSchema,
  redis: redisSchema.optional(),
  postgres: postgresSchema.optional(),
  ai: aiSchema.default({}),
  providers: z.array(providerSchema).min(1),
  search: searchSchema.default({}),
  features: featuresSchema.default({}),
});

export type Config = z.infer<typeof configSchema>;
export type ProviderConfig = z.infer<typeof providerSchema>;
