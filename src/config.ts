export const OPENAI_KEY = process.env['OPENAI_KEY']!;

export const database = {
  MONGO_URI: process.env['MONGO_URI']!,
}

export const discord = {
  token: process.env['DISCORD_TOKEN']!,
};

export const conversation = {
  MAX_TOTAL_CHARACTER_LENGTH: 2000,
  MAX_AGE: 30,
};
