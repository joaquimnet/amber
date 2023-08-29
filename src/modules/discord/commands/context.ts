import { CommandInteraction } from 'discord.js';
import { Command } from '../command';
import conversationModule from '../../conversation/conversation-module';

class ContextCommand extends Command {
  constructor() {
    super({ name: 'context', description: 'Debugging command that prints the conversation context to the console.' });
  }

  async execute(interaction: CommandInteraction) {
    const context = await conversationModule.getContext(interaction.user.id);
    console.log(context);
    await interaction.reply('I posted your context to the console.');
  }
}

export default new ContextCommand();
