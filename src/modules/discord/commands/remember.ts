import { Message } from 'discord.js';
import { Command } from '../command';
import { UserInteraction } from '../../../models';

class RememberCommand extends Command {
  constructor() {
    super({ name: 'remember' });
  }

  async execute(message: Message, args: string) {
    const conversations = await UserInteraction.find(
      { $text: { $search: args }, userId: message.author.id },
      { score: { $meta: 'textScore' } },
    ).sort({
      score: { $meta: 'textScore' },
    });

    for (const conversation of conversations) {
      let formattedConversation = '';
      for (const msg of conversation.context) {
        formattedConversation += `${msg.author}: ${msg.content}\n`;
      }
      const content =
        '```\n' +
        `(id: ${conversation._id} score: ${conversation.get('score')})` +
        '\n' +
        formattedConversation +
        '\n```';
      await message.reply(content);
    }
  }
}

export default new RememberCommand();
