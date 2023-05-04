import { discord } from './config';

import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { events } from './modules/core/event-emitter/event-emitter';
import './modules/discord/commands';
import './modules/core/reminders/reminders';
import { resolveIntent } from './modules/awareness/intent/resolve-intent';
import { ConversationCommand } from './modules/discord/commands/conversation-command';
import { logger } from './log';

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
  events.emit('awareness:conversation:flow:handle-conversation', message, intent as ConversationCommand);
});

bot.login(discord.token);

export { bot };
