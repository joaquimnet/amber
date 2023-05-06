export enum OpenAIRoles {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export type OpenAIMessages = { role: OpenAIRoles; content: string }[];

export interface ChatCompletionOptions {
  userId: string;
  model?: string;
  messages: OpenAIMessages;
  temperature?: number;
  howManyChoicesToGenerate?: number;
  topP?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  logitBias?: { [key: string]: number };
}

export interface OpenAIChatCompletionAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: OpenAIRoles;
      content: string;
    };
    finish_reason: string;
  }[];
}

export interface OpenAICompletionAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    logprobs: null;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
