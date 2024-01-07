import { Message } from 'discord.js';
import persona from '../persona';
import { bot } from '../bot';
import { intentInference } from './intent-inference';
import { logger } from '../log';
import { BotIntent } from './core/intent';
import bye from './intents/bye';

const nicknameRegex = new RegExp(`\\b(${persona.nicknames.join('|')})\\b`, 'gi');
const isMentioningBot = (message: Message) => message.mentions.users.has(bot.user!.id);

const hardcodedIntents: Record<string, BotIntent> = {
  'o/': bye,
};

export async function resolveIntent(message: Message): Promise<BotIntent | null> {
  const content = message.content.toLowerCase();

  const hardcoded = hardcodedIntents[content];

  if (hardcoded) {
    return hardcoded;
  }

  if (!content.match(nicknameRegex) && !isMentioningBot(message)) {
    return null;
  }

  const nlpInference = await intentInference(content);

  if (!nlpInference.intent) {
    return null;
  }

  logger.debug('NLP Intent Inference:', nlpInference);

  if (nlpInference.score < 0.8) {
    return null;
  }

  const intent = bot.intents.get(nlpInference.intent);
  return intent;
}
