import { Client } from 'discord.js';
import { logger } from '../log';
import { commands } from './read-command-files';
import fs from 'fs';
import crypto from 'crypto';

export async function registerCommandsWithDiscord(bot: Client) {
  logger.debug('Registering commands with Discord');

  const commandsResolvable = commands.filter((command) => command.enabled).map((command) => command.toJSON());

  const hash = crypto.createHash('md5').update(JSON.stringify(commandsResolvable)).digest('hex');

  logger.debug('Current hash:', hash);

  try {
    const logFile = fs.readFileSync('./commands.log', 'utf-8').split('\n');
    const lastHash = logFile.at(-2)?.split(' ')?.[1] || null;
    logger.debug('Last hash:', lastHash);

    if (hash === lastHash) {
      logger.debug('Same hash, skipping...');
      return commands;
    }
  } catch {
    // Ignore errors
  }

  fs.writeFileSync('./commands.log', `${new Date().toISOString()} ${hash} \n`, { flag: 'a' });

  await bot.application!.commands.set(commandsResolvable);
  logger.debug('Done!');

  return commands;
}
