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
  MAX_TOTAL_CHARACTER_LENGTH: 3000,
  MAX_AGE: 5,
};

export const ember = {
  UTTERANCES_GUILD: '683463960501944327',
  UTTERANCES_CHANNEL: '1102818884257599518',
};

export const github = {
  GITHUB_TOKEN: process.env['GITHUB_TOKEN']!,
};

export const wakatime = {
  WAKATIME_API_KEY: process.env['WAKATIME_API_KEY']!,
};

export const hanako = {
  HANAKO_SERVER: process.env['HANAKO_SERVER']!,
  HANAKO_ENVIRONMENT: process.env['HANAKO_ENVIRONMENT']!,
  HANAKO_APP: process.env['HANAKO_APP']!,
  HANAKO_API_KEY: process.env['HANAKO_API_KEY']!,
};
