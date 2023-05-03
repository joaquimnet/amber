export const OPENAI_KEY = process.env['OPENAI_KEY']!;

export const database = {
  MONGO_URI: process.env['MONGO_URI']!,
};

export const discord = {
  token: process.env['DISCORD_TOKEN']!,
};

export const conversation = {
  MAX_TOTAL_CHARACTER_LENGTH: 2000,
  MAX_AGE: 30,
};

export const ember = {
  UTTERANCES_GUILD: '683463960501944327',
  UTTERANCES_CHANNEL: '1102818884257599518',
};
