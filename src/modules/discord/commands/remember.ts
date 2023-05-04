import { Message } from 'discord.js';
import { Command } from '../command';
import { UserInteraction } from '../../../models';
import { events } from '../../core/event-emitter/event-emitter';

class RememberCommand extends Command {
  constructor() {
    super({ name: 'remember' });
  }

  async execute(message: Message, args: string) {
    const conversation = await UserInteraction.findOne({ _id: args.trim() });

    if (conversation) {
      await events.emitAsync('awareness:conversation:remember', message.author.id, conversation);
      await message.react('👍');
    } else {
      await message.react('😕');
    }
  }
}

export default new RememberCommand();
