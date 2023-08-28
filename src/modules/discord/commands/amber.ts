import { Message } from 'discord.js';
import { Command } from '../command';
import { openAIService } from '../../openai/openai';

class BotCommand extends Command {
  constructor() {
    super({ name: 'amber', description: 'Introduces Amber to the user.' });
  }

  async execute(message: Message) {
    await message.channel.sendTyping();
    const intro = await openAIService.instructionOrFeedback(
      `Introduce yourself to this user named ${message.member?.nickname || message.author.displayName}. You can use emojis.`,
    );

    await message.reply(intro);
  }
}

export default new BotCommand();
