import { Message } from 'discord.js';

export async function resolveIntent(message: Message) {
  const content = message.content.toLowerCase();

  if (content.includes('remind me') || content.includes('reminder to')) {
    return 'reminders:add';
  }
}
