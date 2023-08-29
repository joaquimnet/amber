import { CommandInteraction } from 'discord.js';
import { Command } from '../command';
import { openAIService } from '../../openai/openai';

class BotCommand extends Command {
  constructor() {
    super({ name: 'amber', description: 'Introduces Amber to the user.' });
  }

  async execute(interaction: CommandInteraction) {
    await interaction.channel?.sendTyping();
    const intro = await openAIService.instructionOrFeedback(
      `Introduce yourself to this user named ${interaction.user.globalName}. You can use emojis.`,
    );

    await interaction.reply(intro);
  }
}

export default new BotCommand();
