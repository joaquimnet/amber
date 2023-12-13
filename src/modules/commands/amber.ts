import { CommandInteraction } from 'discord.js';
import { openAIService } from '../openai/openai';
import { BotCommand } from '../core/command';

class AmberCommand extends BotCommand {
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

export default new AmberCommand();
