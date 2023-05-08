import { Message } from 'discord.js';
import { Command } from '../command';
import { GuildPreferencesDocument } from '../../../models/guild-pereferences.model';

class ChatCommand extends Command {
  constructor() {
    super({ name: 'chat' });
  }

  description = 'Toggles chat mode on/off on the current channel.';

  async execute(message: Message, args: string, guildPreferences: GuildPreferencesDocument) {
    const isCurrentChannelAChatChannel = guildPreferences.conversation.allowedChannels.includes(message.channelId);

    if (isCurrentChannelAChatChannel) {
      guildPreferences.conversation.allowedChannels = guildPreferences.conversation.allowedChannels.filter(
        (channelId) => channelId !== message.channelId,
      );
      await guildPreferences.save();
      await message.reply('Chat mode disabled on this channel.');
      return;
    } else {
      guildPreferences.conversation.allowedChannels.push(message.channelId);
      await guildPreferences.save();
      await message.reply('Chat mode enabled on this channel.');
      return;
    }
  }
}

export default new ChatCommand();
