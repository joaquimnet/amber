import { Message } from 'discord.js';
import { logger } from '../../log';
import { BotIntent } from '../core/intent';
import conversationHandler from '../conversation/conversation-handler';

class ByeIntent extends BotIntent {
  static INTENT = 'greetings.bye';

  constructor() {
    super({ name: ByeIntent.INTENT, enabled: false });
  }

  async execute(message: Message) {
    logger.info(`${ByeIntent.INTENT} triggered!`);
    conversationHandler.endConversation(message);
  }
}

export default new ByeIntent();
