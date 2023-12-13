import { CommandInteraction } from 'discord.js';
import { BotCommand, CommandInteractionOptions } from '../core/command';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';

class ChatCommand extends BotCommand {
  constructor() {
    super({ name: 'chat', description: 'Toggles chat mode on/off on the current channel.' });
  }

  async execute(
    interaction: CommandInteraction,
    options: CommandInteractionOptions,
    guildPreferences: GuildPreferencesDocument,
  ) {
    const isCurrentChannelAChatChannel = guildPreferences.conversation.allowedChannels.includes(interaction.channelId);

    if (isCurrentChannelAChatChannel) {
      guildPreferences.conversation.allowedChannels = guildPreferences.conversation.allowedChannels.filter(
        (channelId) => channelId !== interaction.channelId,
      );
      await guildPreferences.save();
      await interaction.reply('Chat mode disabled on this channel.');
      return;
    } else {
      guildPreferences.conversation.allowedChannels.push(interaction.channelId);
      await guildPreferences.save();
      await interaction.reply('Chat mode enabled on this channel.');
      return;
    }
  }
}

export default new ChatCommand();
