import { Message } from 'discord.js';
import { Command } from '../command';
import { ConversationContext } from '../../awareness/conversation';
import { events } from '../../core/event-emitter/event-emitter';

class ContextCommand extends Command {
  constructor() {
    super({ name: 'context' });
  }

  async execute(message: Message) {
    const context: ConversationContext = await events
      .emitAsync('awareness:conversation:getContext:' + message.author.id, message.author.id)
      .then((ctx) => {
        return ctx[0];
      });

    console.log(context);
    await message.reply('I posted your context to the console.');
  }
}

export default new ContextCommand();
