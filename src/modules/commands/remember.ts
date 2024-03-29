import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { BotCommand, CommandInteractionOptions } from '../core/command';
import { UserInteraction } from '../../models';
import conversationHandler from '../conversation/conversation-handler';

// TODO: turn this into a ConversationCommand

class RememberCommand extends BotCommand {
  constructor() {
    super({
      name: 'remember',
      description: 'Debugging commands that loads the last conversation into the current context.',
      options: [
        {
          name: 'search',
          description: 'Search query',
          type: ApplicationCommandOptionType.String,
          min_length: 3,
          required: true,
        },
      ],
      // enabled: false,
    });
  }

  async execute(interaction: CommandInteraction, options: CommandInteractionOptions) {
    await interaction.deferReply({ ephemeral: true });

    const conversation = await UserInteraction.findOne(
      { $text: { $search: options.getString('search')! } },
      { score: { $meta: 'textScore' } },
    ).sort({ score: { $meta: 'textScore' } });

    if (conversation) {
      await conversationHandler.remember(interaction.user.id, conversation);
      await interaction.editReply({
        content: 'Done!',
      });
    } else {
      await interaction.editReply({
        content: 'No conversation found.',
      });
    }
  }

  override help() {
    return `**${this.name}**\n?${this.name} [search query]`;
  }
}

export default new RememberCommand();
