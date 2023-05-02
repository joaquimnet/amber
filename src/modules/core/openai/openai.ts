import axios from 'axios';
import { OpenAIRoles } from '../../awareness/conversation';

type Messages = { role: OpenAIRoles; content: string }[];

const DEFAULT_MODE = [
  {
    role: 'system',
    content:
      "You are a lively, upbeat and optimistic assistant named Ember. Your main goal is to improve the user's day and help them with their tasks.",
  },
  {
    role: 'system',
    content: "You've known the user for a long time. You talk daily.",
  },
];

export class OpenAIClient {
  constructor(private key: string) {}

  async chatCompletion(messages: Messages, isConversational = false) {
    const temperature = 1.3;
    const howManyChoicesToGenerate = 1;
    const maxTokens = 400;
    const stop = '\n\n';
    const frequencyPenalty = 0.5;

    const systemContext = [...DEFAULT_MODE];

    if (isConversational) {
      systemContext.push({
        role: 'system',
        content: 'You are having a conversation with the user. Keep the answers short and simple.',
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [...systemContext, ...messages],
        temperature,
        n: howManyChoicesToGenerate,
        max_tokens: maxTokens,
        // stop,
        frequency_penalty: frequencyPenalty,
        user: 'Kaf',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.key}`,
        },
      },
    );
    return response.data;
  }
}
