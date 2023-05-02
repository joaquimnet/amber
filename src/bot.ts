import { discord } from './config';

import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { events } from './modules/core/event-emitter/event-emitter';
import { ConversationContext } from './modules/awareness/conversation';

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
    GatewayIntentBits.GuildBans,
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
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

bot.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.author?.id !== '517599684961894400') {
    return;
  }

  // get context for user
  const context: ConversationContext = await events
    .emitAsync('awareness:conversation:getContext:' + message.author.id, message.author.id)
    .then((ctx) => {
      return ctx[0];
    });

  const isCallingEmber = message.content.toLowerCase().match(/\b(ember|embs)\b/);
  const isDismissingEmber = message.content.toLowerCase().match(/\b(bye|see you later) (ember|embs)\b/);
  const hasExistingConversation = context.messages.length > 0;

  if (context.messages.length > 0 && isDismissingEmber) {
    const respondEventPayload = {
      userId: message.author.id,
      context,
      channel: message.channel,
    };
    await events.emitAsync('awareness:conversation:respond', respondEventPayload);
    await events.emit('awareness:conversation:end', message.author.id);
    return;
  }

  if (!hasExistingConversation && !isCallingEmber) return;

  events.emit('awareness:conversation:add', message.author.id, [
    {
      timestamp: new Date(),
      author: 'user',
      content: message.content,
    },
  ]);

  const respondEventPayload = {
    userId: message.author.id,
    context,
    channel: message.channel,
  };
  events.emit('awareness:conversation:respond', respondEventPayload);
});

bot.login(discord.token);

export { bot };
