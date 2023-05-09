import { Message } from 'discord.js';
import { Command } from '../command';
import { openAIService } from '../../openai/openai';
import { splitMessage } from '../../util/discord';

class InstructCommand extends Command {
  constructor() {
    super({ name: 'instruct' });
  }

  async execute(message: Message, args: string) {
    await Promise.all([message.channel.sendTyping(), message.react('🤔')]);

    const result = await openAIService.contextlessDavinciCompletion(args);

    for (const msg of splitMessage(result.choices[0].text)) {
      await message.channel.send(msg);
    }

    await message.reactions.removeAll();
  }
}

export default new InstructCommand();
