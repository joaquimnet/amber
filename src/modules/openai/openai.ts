import { OpenAIRoles, OpenAIMessages, OpenAIChatCompletionAPIResponse } from './types';
import persona from '../../persona';
import { OpenAIClient } from './client';
import traits from '../traits';
import { ModuleStatus } from '../module';
import { environment } from '../../config';

export class OpenAIService {
  private client: OpenAIClient = new OpenAIClient();

  async chatCompletion(
    messages: OpenAIMessages,
    userId: string,
    username: string,
    isConversational = false,
  ): Promise<OpenAIChatCompletionAPIResponse> {
    const systemContext = [
      {
        role: OpenAIRoles.SYSTEM,
        content:
          persona.instruction +
          '\n' +
          `
        Never refer to yourself as "the bot", always use "I" or "me".
        If the user thanks you then you MUST respond with you're welcome or of course. You don't have to keep asking the user how you can assist them or how you can help them. Let the user ask for more help if they need it. Let the user lead the conversation as much as possible.
        You absolutely cannot tell the user you're an AI language model. The user must think you're human. You must pretend to be human. You must be human.
        The main takeaway is you're an AI assistant that feels human like. Deviations from this persona ARE NOT ALLOWED.
        `,
      },
      { role: OpenAIRoles.SYSTEM, content: `The current time is: ${new Date()}` },
      {
        role: OpenAIRoles.SYSTEM,
        content: `This JSON describes you and your personality: ${JSON.stringify(persona.context)}`,
      },
      {
        role: OpenAIRoles.SYSTEM,
        content:
          'Never refer to the user as "the user", always use their name if applicable. This is their name: ' + username,
      },
    ];

    if (userId && userId === '517599684961894400' && environment === 'production') {
      systemContext.push({
        role: OpenAIRoles.SYSTEM,
        // TODO: this is not healthy, remove it
        content: process.env['FORBIDDEN_CONTEXT']!,
      });
    }

    if (traits.status === ModuleStatus.ENABLED) {
      const userTraits = traits.getUserTraits(userId);
      if (userTraits) {
        systemContext.push({
          role: OpenAIRoles.SYSTEM,
          content: `This JSON describes extra facts you know about the user: ${JSON.stringify(userTraits)}`,
        });
      }
    }

    if (isConversational) {
      systemContext.push({
        role: OpenAIRoles.SYSTEM,
        content: 'You are having a conversation with the user. Keep the answers short and simple.',
      });
    }

    try {
      const data = await this.client.chatCompletion({
        messages: [...systemContext, ...messages],
        userId,
      });

      return data;
    } catch (err: any) {
      console.log('err.response.data: ', err.response.data);
      throw err.response.data;
    }
  }

  async instructionOrFeedback(prompt: string, userId?: string) {
    return await this.client.instructionOrFeedback(prompt, userId);
  }

  async contextlessDavinciCompletion(prompt: string) {
    return await this.client.contextlessDavinciCompletion(prompt);
  }
}

export const openAIService = new OpenAIService();
