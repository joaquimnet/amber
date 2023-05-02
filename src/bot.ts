import { discord } from './config';

import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { events } from './modules/core/event-emitter/event-emitter';
import { ConversationContext } from './modules/awareness/conversation';
import { expandUtterances } from './modules/awareness/intent/nlp/expand-utterances';
import { splitMessage } from './modules/core/util/discord';
import { openAIClient } from './modules/core/openai/openai';
import { UserInteraction } from './models';

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
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

bot.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.author?.id !== '517599684961894400') {
    return;
  }

  // Commands

  if (message.content.toLowerCase().startsWith('!ping')) {
    await message.reply('pong');
    return;
  }

  if (message.content.toLowerCase().startsWith('!intent')) {
    const [command, args] = [message.content.split(' ')[0], message.content.split(' ').slice(1).join(' ')];

    const utterances = expandUtterances(args);

    for (const msg of splitMessage(utterances)) {
      await message.reply(msg);
    }

    return;
  }

  if (message.content.toLowerCase().startsWith('!reason')) {
    const [command, args] = [message.content.split(' ')[0], message.content.split(' ').slice(1).join(' ')];

    const json = await events.emitAsync('reason:resolve-task', args);

    const content = '```json\n' + JSON.stringify(json[0], null, 2) + '\n```';
    message.reply(content);
    return;
  }

  if (message.content.toLowerCase().startsWith('!ember')) {
    await message.channel.sendTyping();
    const intro = await openAIClient.instructionOrFeedback(
      `Introduce yourself to this user named ${message.member?.nickname || message.author.username}.`,
    );

    await message.reply(intro);
    return;
  }

  if (message.content.toLowerCase().startsWith('!remember')) {
    const [command, args] = [message.content.split(' ')[0], message.content.split(' ').slice(1).join(' ')];

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
      const content = '```\n' + `(score: ${conversation.get('score')})` + '\n' + formattedConversation + '\n```';
      await message.reply(content);
    }
  }

  // Known Intents
  // const intent = await events.emitAsync('awareness:intent:resolve', message.content);

  // Conversation

  // add check to see if this is a registered channel for Ember conversations

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
    console.log('context (dismissing): ', context);
    await events.emitAsync('awareness:conversation:add', message.author.id, [
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
    await message.channel.sendTyping();
    await events.emitAsync('awareness:conversation:respond', respondEventPayload);
    await events.emit('awareness:conversation:end', message.author.id);
    return;
  }

  if (!hasExistingConversation && !isCallingEmber) return;

  await events.emitAsync('awareness:conversation:add', message.author.id, [
    {
      timestamp: new Date(),
      author: 'user',
      content: message.content,
    },
  ]);

  console.log('context: ', context);

  const respondEventPayload = {
    userId: message.author.id,
    context,
    channel: message.channel,
  };
  await message.channel.sendTyping();
  events.emit('awareness:conversation:respond', respondEventPayload);
});

bot.login(discord.token);

export { bot };
