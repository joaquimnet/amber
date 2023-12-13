import { CommandInteraction } from 'discord.js';
import { BotCommand } from '../core/command';
import { logger } from '../../log';
import conversationHandler from '../conversation/conversation-handler';

class ContextCommand extends BotCommand {
  constructor() {
    super({ name: 'context', description: 'Debugging command that prints the conversation context to the console.' });
  }

  async execute(interaction: CommandInteraction) {
    const context = conversationHandler.getChat(interaction.user.id);
    logger.debug(context);
    await interaction.reply('I posted your context to the console.');
  }
}

export default new ContextCommand();
