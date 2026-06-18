export interface GuildSettings {
  logChannelId?: string;
  aiChannelId?: string;
  provider?: {
    name: string;
    token: string;
    model?: string;
    baseUrl?: string;
  };
}
