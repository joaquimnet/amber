import { Message } from 'discord.js';
import { ConversationCommand } from '../conversation/commands/conversation-command';
import codingStats from '../conversation/commands/coding-stats';
import persona from '../../persona';

const nicknameRegex = new RegExp(`\\b(${persona.nicknames.join('|')})\\b`, 'gi');

export async function resolveIntent(message: Message): Promise<string | ConversationCommand | undefined> {
  const content = message.content.toLowerCase();

  if (!content.match(nicknameRegex)) return;

  if (content.includes('remind me') || content.includes('reminder to')) {
    return 'reminders:add';
  }

  if (/(coding|code|programming|github|wakatime) (stats|status|statistics|summary|commits)/gi.test(content)) {
    return codingStats;
  }
}
