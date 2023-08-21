/* eslint-disable complexity */
import { discord } from './config';
import { Client, Events, GatewayIntentBits, Message, Partials } from 'discord.js';
import { ConversationCommand } from './modules/conversation/commands/conversation-command';
import { logger } from './log';
import { events } from './modules/events';
import { resolveIntent } from './modules/intent/resolve-intent';
import conversationFlowModule from './modules/conversation/conversation-flow-module';
import './modules/discord/commands';
import { GuildPreferences } from './models/guild-pereferences.model';

const bot = new Client({
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
});

bot.once(Events.ClientReady, (c) => {
  logger.info(`Ready! Logged in as ${c.user.tag}`);
});

const messageContainsBotMention = (message: Message) => {
  return message.mentions.users.has(bot.user!.id);
};

bot.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const guildPreferences = await GuildPreferences.findOneAndUpdate(
    { guildId: message.guildId },
    { guildId: message.guildId },
    { upsert: true, new: true },
  );

  // Commands
  if (message.content.toLowerCase().startsWith('?')) {
    const [command, args] = [message.content.split(' ')[0].slice(1), message.content.split(' ').slice(1).join(' ')];
    events.emit('discord:command:' + command, message, args, guildPreferences);
    return;
  }

  const channelId = message.channelId;
  const isConversationChannel = guildPreferences?.conversation.allowedChannels.includes(channelId);
  const noConversationChannelsRegistered = guildPreferences?.conversation.allowedChannels.length === 0;
  const isBotMentioned = messageContainsBotMention(message);

  console.log({
    isConversationChannel,
    noConversationChannelsRegistered,
    isBotMentioned,
  });

  // mentioning the bot when there is no conversation channel registered
  if (noConversationChannelsRegistered && isBotMentioned) {
    await message.reply(
      "I'm not allowed to talk in the server yet. Please ask an admin to register a conversation channel using the `?chat` command.",
    );
    return;
  }

  // not a conversation channel and not mentioning the bot
  // the !isBotMentioned check is to allow conversation outside conversation channels if the user is explicitly mentioning the bot
  if (!isConversationChannel && !isBotMentioned) {
    console.log('not a conversation channel and not mentioning the bot');
    return;
  }

  // Known Intents
  const intent = await resolveIntent(message);

  if (intent && !(intent instanceof ConversationCommand)) {
    events.emit('awareness:intent:' + intent, message);
    return;
  }

  // Conversation
  await conversationFlowModule.handleConversation(message, intent as ConversationCommand);
});

bot.login(discord.token);

export { bot };
