import { Message } from 'discord.js';
import { Command } from '../command';
import { UserInteraction } from '../../../models';
import conversationModule from '../../conversation/conversation-module';

// TODO: turn this into a ConversationCommand

class RememberCommand extends Command {
  constructor() {
    super({
      name: 'remember',
      description: 'Debugging commands that loads the last conversation into the current context.',
    });
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

  override help() {
    return `**${this.name}**\n?${this.name} [search query]`;
  }
}

export default new RememberCommand();
