import { Message } from 'discord.js';
import { Command } from '../command';
import { UserInteraction } from '../../../models';
import conversationModule from '../../conversation/conversation-module';

// TODO: turn this into a ConversationCommand

class RememberCommand extends Command {
  constructor() {
    super({ name: 'remember' });
  }

  async execute(message: Message, args: string) {
    const conversation = await UserInteraction.findOne(
      { $text: { $search: args.trim() } },
      { score: { $meta: 'textScore' } },
    ).sort({ score: { $meta: 'textScore' } });

    if (conversation) {
      await conversationModule.remember(message.author.id, conversation);
      await message.react('👍');
    } else {
      await message.react('😕');
    }
  }
}

export default new RememberCommand();
