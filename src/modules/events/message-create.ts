import { Message } from 'discord.js';
import { Core } from '../core/bot';
import { bot } from '../../bot';
import { logger } from '../../log';
import conversationFlowModule from '../conversation/conversation-handler';
import { resolveIntent } from '../resolve-intent';

export async function onMessageCreate(message: Message) {
  if (message.author.bot) return;

  const guildPreferences = await Core.getGuildPreferences(message.guildId!);

  const isBotMentioned = message.mentions.users.has(bot.user!.id);
  const noConversationChannelsRegistered = guildPreferences?.conversation.allowedChannels.length === 0;

  // Mentioning the bot when there is no conversation channel registered
  if (noConversationChannelsRegistered && isBotMentioned) {
    await message.reply(
      "I'm not allowed to talk in the server yet. Please ask an admin to register a conversation channel using the `/chat` command.",
    );
    return;
  }

  const isConversationChannel = guildPreferences?.conversation.allowedChannels.includes(message.channelId);

  // Not a conversation channel and not mentioning the bot
  // The !isBotMentioned check is to allow conversation outside conversation channels if the user is explicitly mentioning the bot
  if (!isConversationChannel && !isBotMentioned) {
    return;
  }

  const intent = await resolveIntent(message);

  if (intent) {
    logger.debug(`User ${message.author.globalName} executes intent ${intent.name}`);
    const mustContinue = await intent.execute(message, guildPreferences);
    if (!mustContinue) {
      return;
    }
  }

  // Conversation
  await conversationFlowModule.handleDiscordMessage(message, guildPreferences);
}
