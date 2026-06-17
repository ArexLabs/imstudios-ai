export interface AiRequest {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}

export interface AiResponse {
  text: string;
  provider: string;
}
