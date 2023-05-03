import { Message } from 'discord.js';
import { events } from '../../core/event-emitter/event-emitter';
import { ConversationContext } from './context';
import { EmberConversationRoles } from './types';
import { OperationalLog } from '../../../models';

events.on('awareness:conversation:flow:handle-conversation', async (message: Message) => {
  // add check to see if this is a registered channel for Ember conversations

  // Checking if user is responding to an Ember utterance
  const latestUtteranceInThisChannel = await OperationalLog.findOne({
    'meta.discordChannelId': message.channel.id,
  }).sort({ createdAt: -1 });

  if (latestUtteranceInThisChannel) {
    const last2MessagesInChannel = message.channel.messages.cache.last(2);
    const channelHasMessages =
      last2MessagesInChannel && Array.isArray(last2MessagesInChannel) && last2MessagesInChannel.length === 2;

    if (channelHasMessages) {
      const possibleEmberUtterance = last2MessagesInChannel[0];
      if (latestUtteranceInThisChannel.meta.discordMessageId === possibleEmberUtterance.id) {
        events.emit('awareness:conversation:flow:ember-started', message, latestUtteranceInThisChannel);
        return;
      }
    }
  }

  const context: ConversationContext = await events
    .emitAsync('awareness:conversation:getContext:' + message.author.id, message.author.id)
    .then((ctx) => {
      return ctx[0];
    });

  const isCallingEmber = message.content.toLowerCase().match(/\b(ember|embs)\b/);
  const isDismissingEmber = message.content.toLowerCase().match(/\b(bye|see you later) (ember|embs)\b/);
  const hasExistingConversation = context.messages.length > 0;

  if (hasExistingConversation && isDismissingEmber) {
    events.emit('awareness:conversation:flow:dismiss', message);
    return;
  }

  if (!hasExistingConversation && !isCallingEmber) return;

  events.emit('awareness:conversation:flow:begin', message);
});

events.on(
  'awareness:conversation:flow:dismiss',
  async (message) => {
    const context: ConversationContext = await events
      .emitAsync('awareness:conversation:getContext:' + message.author.id, message.author.id)
      .then((ctx) => {
        return ctx[0];
      });

    await events.emitAsync('awareness:conversation:add', message.author.id, [
      {
        timestamp: new Date(),
        author: EmberConversationRoles.USER,
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
  },
  { promisify: true },
);

events.on(
  'awareness:conversation:flow:begin',
  async (message) => {
    const context: ConversationContext = await events
      .emitAsync('awareness:conversation:getContext:' + message.author.id, message.author.id)
      .then((ctx) => {
        return ctx[0];
      });

    await events.emitAsync('awareness:conversation:add', message.author.id, [
      {
        timestamp: new Date(),
        author: EmberConversationRoles.USER,
        content: message.content,
      },
    ]);

    const respondEventPayload = {
      userId: message.author.id,
      context,
      channel: message.channel,
    };
    await message.channel.sendTyping();
    events.emit('awareness:conversation:respond', respondEventPayload);
  },
  { promisify: true },
);

events.on(
  'awareness:conversation:flow:ember-started',
  async (message, utterance) => {
    const context: ConversationContext = await events
      .emitAsync('awareness:conversation:getContext:' + message.author.id, message.author.id)
      .then((ctx) => {
        return ctx[0];
      });
    await events.emitAsync('awareness:conversation:add', message.author.id, [
      {
        timestamp: new Date(),
        author: EmberConversationRoles.EMBER,
        content: utterance.message,
      },
    ]);
    const respondEventPayload = {
      userId: message.author.id,
      context,
      channel: message.channel,
    };
    await message.channel.sendTyping();
    events.emit('awareness:conversation:respond', respondEventPayload);
  },
  { promisify: true },
);
