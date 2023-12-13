import { BotIntent } from '../core/intent';

export class IntentHandler {
  private intents: Map<string, BotIntent> = new Map();

  registerIntents(intents: BotIntent[]) {
    for (const intent of intents) {
      this.intents.set(intent.name, intent);
    }
  }

  get(intentName: string) {
    return this.intents.get(intentName) || null;
  }
}

export const intentHandler = new IntentHandler();
