import { config } from 'dotenv';
config();

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}
export const environment: Environment = (process.env['NODE_ENV'] as Environment) ?? Environment.DEVELOPMENT;

export const OPENAI_KEY = process.env['OPENAI_KEY']!;

export const database = {
  MONGO_URI: process.env['MONGO_URI']!,
};

export const discord = {
  token: process.env['DISCORD_TOKEN']!,
};

export const conversation = {
  MAX_TOTAL_CHARACTER_LENGTH: 14000,
  MAX_AGE: 30,
};

export const utterancesConfig = {
  UTTERANCES_GUILD: '683463960501944327',
  UTTERANCES_CHANNEL: '1102818884257599518',
};

export const github = {
  GITHUB_TOKEN: process.env['GITHUB_TOKEN']!,
};

export const wakatime = {
  WAKATIME_API_KEY: process.env['WAKATIME_API_KEY']!,
};

export const NOTIFICATIONS_TOPIC = process.env['NOTIFICATIONS_TOPIC']!;
