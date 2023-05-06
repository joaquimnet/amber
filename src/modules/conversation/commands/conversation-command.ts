import { Message } from 'discord.js';
import { ContextMessage } from '../conversation-context';

export abstract class ConversationCommand {
  name: string;
  intent: string;

  constructor({ name, intent }: { name: string; intent: string }) {
    this.name = name;
    this.intent = intent;
  }

  abstract execute(message: Message): Promise<ContextMessage[] | undefined>;
}
