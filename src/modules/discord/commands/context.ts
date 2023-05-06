import { Message } from 'discord.js';
import { Command } from '../command';
import conversationModule from '../../conversation/conversation-module';

class ContextCommand extends Command {
  constructor() {
    super({ name: 'context' });
  }

  async execute(message: Message) {
    const context = await conversationModule.getContext(message.author.id);
    console.log(context);
    await message.reply('I posted your context to the console.');
  }
}

export default new ContextCommand();
