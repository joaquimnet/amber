import { Message } from 'discord.js';
import { bot } from '../../bot';
import { logger } from '../../log';
import { BotIntent } from '../core/intent';

class ReminderAddIntent extends BotIntent {
  static INTENT = 'reminders.add';

  constructor() {
    super({ name: ReminderAddIntent.INTENT });
  }

  async execute(message: Message) {
    logger.info(`${ReminderAddIntent.INTENT} triggered!`);
    bot.reminders.onAddReminder(message);
  }
}

export default new ReminderAddIntent();
