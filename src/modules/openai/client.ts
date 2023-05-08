import axios from 'axios';
import { OPENAI_KEY } from '../../config';
import { ChatCompletionOptions, OpenAIChatCompletionAPIResponse, OpenAICompletionAPIResponse, OpenAIRoles } from './types';
import persona from '../../persona';
import { logger } from '../../log';

const defaultChatCompletionOptions: Omit<ChatCompletionOptions, 'userId' | 'messages'> = {
  model: 'gpt-3.5-turbo',
  temperature: 1.3,
  maxTokens: 400,
  frequencyPenalty: 0.5,
  howManyChoicesToGenerate: 1,
};

export class OpenAIClient {
  axios = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
  });

  async chatCompletion(options: ChatCompletionOptions): Promise<OpenAIChatCompletionAPIResponse> {
    const opts: ChatCompletionOptions = { ...defaultChatCompletionOptions, ...options };

    try {
      const response = await this.axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [toSystemMessage(persona.instruction), ...opts.messages],
        temperature: opts.temperature,
        n: opts.howManyChoicesToGenerate,
        max_tokens: opts.maxTokens,
        frequency_penalty: opts.frequencyPenalty,
        user: opts.userId,
      });
      logger.info('OpenAI Request (chat)', { meta: response.data });
      return response.data;
    } catch (err: any) {
      console.log('err.response.data: ', err.response.data);
      throw err.response.data;
    }
  }

  async instructionOrFeedback(prompt: string, userId?: string): Promise<string> {
    const temperature = 1.3;
    const howManyChoicesToGenerate = 1;
    const maxTokens = 1200;
    const frequencyPenalty = 0.5;

    try {
      const response = await this.axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: OpenAIRoles.SYSTEM, content: persona.instruction },
          { role: OpenAIRoles.SYSTEM, content: prompt },
        ],
        temperature,
        n: howManyChoicesToGenerate,
        max_tokens: maxTokens,
        frequency_penalty: frequencyPenalty,
        user: userId || 'Kaf',
      });
      logger.info('OpenAI Request (instruction)', { meta: response.data });
      return response.data.choices[0].message.content;
    } catch (err: any) {
      console.log('err.response.data: ', err.response.data);
      throw err.response.data;
    }
  }

  async contextlessDavinciCompletion(prompt: string): Promise<OpenAICompletionAPIResponse> {
    const temperature = 0.8;
    const howManyChoicesToGenerate = 1;
    const maxTokens = 400;
    // this helps with code generation
    const frequencyPenalty = 0;

    try {
      const response = await this.axios.post('https://api.openai.com/v1/completions', {
        model: 'text-davinci-003',
        prompt,
        temperature,
        n: howManyChoicesToGenerate,
        max_tokens: maxTokens,
        // stop,
        frequency_penalty: frequencyPenalty,
        user: 'Kaf',
      });
      logger.info('OpenAI Request (system)', { meta: response.data });
      return response.data;
    } catch (err: any) {
      throw err.response.data;
    }
  }

  // might be used again later
  // private async refreshPersonalityTraits() {
  //   const traits = (await (PersonalityTrait as any).getUserTraits('ember'))[0]?.traits as Record<string, string[]>;
  //   emberPersonalityTraits = JSON.stringify(traits);
  // }
}

function toSystemMessage(message: string) {
  return { role: OpenAIRoles.SYSTEM, content: message };
}
