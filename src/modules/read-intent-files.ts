import { join } from 'path';
import { getFilesRecursively } from './util/fs';
import { BotIntent } from './core/intent';

export const intents: BotIntent[] = [];

export async function loadAllIntents() {
  const intentFiles = getFilesRecursively(join(__dirname, 'intents'));

  for (const file of intentFiles) {
    const intent = await import(file);
    if (intent.default.enabled) {
      intents.push(intent.default);
    }
  }

  return intents;
}
