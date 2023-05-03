import { TextChannel } from 'discord.js';
import { bot } from '../../../bot';
import { ember } from '../../../config';
import { events } from '../../core/event-emitter/event-emitter';
import { allUtterances } from './utterances';
import { Utterance } from './utterances/utterance';
import { splitMessage } from '../../core/util/discord';
import { OperationalLog } from '../../../models';

const AutonomousUtterancesCooldowns = new Map<Utterance['id'], number>();

for (const utterance of allUtterances) {
  AutonomousUtterancesCooldowns.set(utterance.getId(), utterance.getDefaultCooldown());
}

function calculateNewCooldownTimestamp(cooldown: number) {
  const now = Date.now();
  const cooldownTimestamp = now + cooldown * 60 * 1000;
  return cooldownTimestamp;
}

export async function registerAutonomousUtterancesEvents() {
  events.on('cron:minute', async () => {
    console.log('cron:minute');
    const now = Date.now();
    for (const utterance of allUtterances) {
      const cooldown = AutonomousUtterancesCooldowns.get(utterance.getId());
      if (cooldown !== undefined && now > cooldown) {
        const shouldRun = await utterance.shouldRun();
        if (shouldRun) {
          const message = await utterance.generate();
          events.emit('autonomy:utterance', utterance.getId(), message);
          const newCooldown = await utterance.getNewCooldown();
          const newCooldownTimestamp = calculateNewCooldownTimestamp(newCooldown);
          AutonomousUtterancesCooldowns.set(utterance.getId(), newCooldownTimestamp);
        }
      }
    }
  });

  events.on('autonomy:utterance', async (utteranceId: string, message: string) => {
    console.log('autonomy:utterance');
    const channel = bot.guilds.cache.get(ember.UTTERANCES_GUILD)?.channels.cache.get(ember.UTTERANCES_CHANNEL);
    if (channel instanceof TextChannel) {
      const messages = splitMessage(message);
      for (const message of messages) {
        const sentMessage = await channel.send(message);
        await OperationalLog.create({
          type: 'autonomy:utterance',
          message,
          meta: {
            discordChannelId: channel.id,
            discordMessageId: sentMessage.id,
            utteranceId,
          },
        });
      }
    }
  });
}
