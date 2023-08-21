import { TextChannel } from 'discord.js';
import { bot } from '../../bot';
import { utterancesConfig } from '../../config';
import { Chat } from './chats/chat';
import { OperationalLog } from '../../models';
import { events } from '../events';
import { splitMessage } from '../util/discord';
import { allChats } from './chats';

const AutoChatsCooldowns = new Map<Chat['id'], number>();

for (const chat of allChats) {
  AutoChatsCooldowns.set(chat.getId(), chat.getDefaultCooldown());
}

function calculateNewCooldownTimestamp(cooldown: number) {
  const now = Date.now();
  const cooldownTimestamp = now + cooldown * 60 * 1000;
  return cooldownTimestamp;
}

export async function registerAutonomousUtterancesEvents() {
  events.on('cron:minute', async () => {
    const now = Date.now();
    for (const utterance of allChats) {
      const cooldown = AutoChatsCooldowns.get(utterance.getId());
      if (cooldown !== undefined && now > cooldown) {
        const shouldRun = await utterance.shouldRun();
        if (shouldRun) {
          const message = await utterance.generate();
          events.emit('autonomy:chat', utterance.getId(), message);
          const newCooldown = await utterance.getNewCooldown();
          const newCooldownTimestamp = calculateNewCooldownTimestamp(newCooldown);
          AutoChatsCooldowns.set(utterance.getId(), newCooldownTimestamp);
        }
      }
    }
  });

  events.on('autonomy:chat', async (utteranceId: string, message: string) => {
    const channel = bot.guilds.cache.get(utterancesConfig.UTTERANCES_GUILD)?.channels.cache.get(utterancesConfig.UTTERANCES_CHANNEL);
    if (channel instanceof TextChannel) {
      const messages = splitMessage(message);
      for (const message of messages) {
        if (message) {
          const sentMessage = await channel.send(message);
          await OperationalLog.create({
            type: 'autonomy:chat',
            message,
            meta: {
              discordChannelId: channel.id,
              discordMessageId: sentMessage.id,
              utteranceId,
            },
          });
        }
      }
    }
  });
}
