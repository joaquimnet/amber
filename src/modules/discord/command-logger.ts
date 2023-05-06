import { logger } from '../../log';
import { events } from '../events';

events.prependListener('discord:command:*', (message, args) => {
  const command = message.content.split(' ')[0].slice(1);

  logger.info(`commands | ${message.author.tag} (${message.author.id}) | ${command} ${args}`, {
    meta: {
      discord: {
        command,
        args,
        guild: message.guild?.id,
        channel: message.channel.id,
        message: message.id,
        user: message.author.id,
      },
    },
  });
});
