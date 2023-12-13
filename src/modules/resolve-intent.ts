import { Message } from 'discord.js';
import persona from '../persona';
import { bot } from '../bot';
import { intentInference } from './intent-inference';
import { logger } from '../log';
import { BotIntent } from './core/intent';

const nicknameRegex = new RegExp(`\\b(${persona.nicknames.join('|')})\\b`, 'gi');
const isMentioningBot = (message: Message) => message.mentions.users.has(bot.user!.id);

export async function resolveIntent(message: Message): Promise<BotIntent | null> {
  const content = message.content.toLowerCase();

  if (!content.match(nicknameRegex) && !isMentioningBot(message)) {
    return null;
  }

  const nlpInference = await intentInference(content);

  if (!nlpInference.intent) {
    return null;
  }

  logger.debug('NLP Intent Inference:', nlpInference);

  const intent = bot.intents.get(nlpInference.intent);
  return intent;
}
