import { Client } from 'discord.js';
import assert from 'assert';
import { reminderHandler } from './modules/reminders/reminders';
import { intentHandler } from './modules/intent-inference/intent-handler';

export function initModules(_bot: Client): Amber.Client {
  const bot = _bot as Amber.Client;

  bot.reminders = reminderHandler;
  bot.intents = intentHandler;
  bot.isMentioningBot = (message) => message.mentions.users.has(bot.user!.id);

  assert(bot.reminders !== undefined, 'bot.reminders is undefined');
  assert(bot.intents !== undefined, 'bot.intents is undefined');
  assert(bot.isMentioningBot !== undefined, 'bot.isMentioningBot is undefined');

  return bot as Amber.Client;
}
