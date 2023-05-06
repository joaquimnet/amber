import { discord } from './config';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { ConversationCommand } from './modules/conversation/commands/conversation-command';
import { logger } from './log';
import { events } from './modules/events';
import { resolveIntent } from './modules/intent/resolve-intent';
import conversationFlowModule from './modules/conversation/conversation-flow-module';
import './modules/discord/commands';

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

bot.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // Commands
  if (message.content.toLowerCase().startsWith('!')) {
    const [command, args] = [message.content.split(' ')[0].slice(1), message.content.split(' ').slice(1).join(' ')];
    events.emit('discord:command:' + command, message, args);
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
