import { TextChannel } from 'discord.js';
import { OPENAI_KEY } from '../../../config';
import { events } from '../../core/event-emitter/event-emitter';
import { OpenAIClient } from '../../core/openai/openai';
import { contextAgeCull, contextLengthCull } from './constraints';
import { ConversationContext, ContextMessage } from './context';
import { EmberConversationRoles } from './types';

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

const openAIClient = new OpenAIClient(OPENAI_KEY);

export function registerConversationEvents() {
  events.on('awareness:enabled', () => {
    events.on('awareness:conversation:add', (userId: string, messages: ContextMessage[]) => {
      console.log('awareness:conversation:add');

      const context = getContext(userId);

      context.addMessages(messages);

      // cull messages old messages and keep the context token count low
      contextAgeCull(context);
      contextLengthCull(context);
    });

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

        channel.send(responseText);

        events.emit('awareness:conversation:add', userId, [
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
