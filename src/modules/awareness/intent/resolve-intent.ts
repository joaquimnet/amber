import { Message } from 'discord.js';
import { ConversationCommand } from '../../discord/commands/conversation-command';
import { codingStatsCommand } from '../../discord/commands';

const emberNamesAndNicknames = ['ember', 'embs', 'emby', 'em', 'embsy'];
const nicknameRegex = new RegExp(`\\b(${emberNamesAndNicknames.join('|')})\\b`, 'gi');

export async function resolveIntent(message: Message): Promise<string | ConversationCommand | undefined> {
  const content = message.content.toLowerCase();

  if (!content.match(nicknameRegex)) return;

  if (content.includes('remind me') || content.includes('reminder to')) {
    return 'reminders:add';
  }

  if (/(coding|code|programming|github|wakatime) (stats|status|statistics|summary|commits)/gi.test(content)) {
    return codingStatsCommand;
  }
}
