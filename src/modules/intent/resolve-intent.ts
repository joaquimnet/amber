import { Message } from 'discord.js';
import { ConversationCommand } from '../conversation/commands/conversation-command';
import codingStats from '../conversation/commands/coding-stats';
import persona from '../../persona';
import { bot } from '../../bot';
import { intentInference } from './nlp';

const nicknameRegex = new RegExp(`\\b(${persona.nicknames.join('|')})\\b`, 'gi');
const isMentioningBot = (message: Message) => message.mentions.users.has(bot.user!.id);

export async function resolveIntent(message: Message): Promise<string | ConversationCommand | undefined> {
  const content = message.content.toLowerCase();

  if (!content.match(nicknameRegex) && !isMentioningBot(message)) return;

  const nlpInference = await intentInference(content);

  if (nlpInference.intent) {
    console.log('nlpInference: ', nlpInference);
  }

  if (content.includes('remind me') || content.includes('reminder to')) {
    return 'reminders:add';
  }

  if (/(coding|code|programming|github|wakatime) (stats|status|statistics|summary|commits)/gi.test(content)) {
    return codingStats;
  }
}
