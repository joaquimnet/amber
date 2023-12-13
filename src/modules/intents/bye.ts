import { logger } from '../../log';
import { BotIntent } from '../core/intent';

class ByeIntent extends BotIntent {
  static INTENT = 'greetings.bye';

  constructor() {
    super({ name: ByeIntent.INTENT, enabled: false });
  }

  async execute() {
    logger.info(`${ByeIntent.INTENT} triggered!`);
  }
}

export default new ByeIntent();
