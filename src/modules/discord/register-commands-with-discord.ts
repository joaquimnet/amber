import { Client } from 'discord.js';
import { logger } from '../../log';
import { commands } from '.';
import fs from 'fs';
import crypto from 'crypto';

export async function registerCommandsWithDiscord(bot: Client) {
  logger.debug('registering commands with discord');

  const commandsResolvable = commands.filter((command) => command.enabled).map((command) => command.toJSON());
  const hash = crypto.createHash('md5').update(JSON.stringify(commandsResolvable)).digest('hex');
  logger.debug('current hash:', hash);

  try {
    const logFile = fs.readFileSync('./commands.log', 'utf-8').split('\n');
    const lastHash = secondToLast(logFile)?.split(' ')?.[1] || null;
    logger.debug('last hash:   ', lastHash);

    if (hash === lastHash) {
      logger.debug('same hash, skipping...');
      return commands;
    }
  } catch {
    /* empty */
  }

  fs.writeFileSync('./commands.log', `${new Date().toISOString()} ${hash} \n`, { flag: 'a' });

  await bot.application!.commands.set(commandsResolvable);
  logger.debug('done!');

  return commands;
}

const secondToLast = (arr: any[]) => arr[arr.length - 2];
