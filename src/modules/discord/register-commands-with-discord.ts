import { Client } from 'discord.js';
import { logger } from '../../log';
import { commands } from '.';

export async function registerCommandsWithDiscord(bot: Client) {
  logger.debug('registering commands with discord');
  await bot.application!.commands.set(commands.filter((command) => command.enabled).map((command) => command.toJSON()));
  return commands;
}
