import { TextChannel } from 'discord.js';
import { events } from '../../core/event-emitter/event-emitter';
import { openAIClient } from '../../core/openai/openai';
import { contextAgeCull, contextLengthCull } from './constraints';
import { ConversationContext, ContextMessage } from './context';
import { EmberConversationRoles } from './types';
import { splitMessage } from '../../core/util/discord';

const conversationContexts = new Map<string, ConversationContext>();

function getContext(userId: string) {
  const context = conversationContexts.get(userId);

  if (!context) {
    const newContext = new ConversationContext(userId);
    conversationContexts.set(userId, newContext);
    return newContext;
  }

  return context;
}

export function registerConversationEvents() {
  events.on('awareness:enabled', () => {
    events.on('awareness:conversation:add', async (userId: string, messages: ContextMessage[]) => {
      console.log('awareness:conversation:add');

      const context = getContext(userId);

      await context.addMessages(messages);

      // cull messages old messages and keep the context token count low
      contextAgeCull(context);
      contextLengthCull(context);
    }, { promisify: true });

    events.on('awareness:conversation:end', (userId: string) => {
      console.log('awareness:conversation:end');
      conversationContexts.delete(userId);
    });

    events.on(
      'awareness:conversation:getContext:*',
      async (userId: string) => {
        console.log('awareness:conversation:getContext');
        return getContext(userId);
      },
      { promisify: true },
    );

    events.on(
      'awareness:conversation:respond',
      async (payload: { userId: string; context: ConversationContext; channel: TextChannel }) => {
        console.log('awareness:conversation:respond');
        const { userId, context, channel } = payload;

        const response = await openAIClient.chatCompletion(context.formatForOpenAI(), true);

        const responseText = response.choices[0].message.content;

        for (const msg of splitMessage(responseText)) {
          await channel.send(msg);
        }

        await events.emitAsync('awareness:conversation:add', userId, [
          {
            timestamp: new Date(),
            author: EmberConversationRoles.EMBER,
            content: responseText,
          },
        ]);
      },
      { promisify: true },
    );
  });
}
