import { BotCommand } from './core/command';
import { join } from 'path';
import { getFilesRecursively } from './util/fs';

export const commands: BotCommand[] = [];

export async function loadAllCommands() {
  const commandFiles = getFilesRecursively(join(__dirname, 'commands'));

  for (const file of commandFiles) {
    const command = await import(file);
    commands.push(command.default);
  }

  return commands;
}
