export interface AiProcessingJobData {
  guildId: string;
  channelId: string;
  authorId: string;
  content: string;
  providerOverride?: {
    name: string;
    token: string;
    model?: string;
    baseUrl?: string;
  };
}
