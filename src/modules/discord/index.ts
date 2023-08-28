import fs from 'fs';
import path from 'path';
import { Command } from './command';

export const commands: Command[] = [];

export async function loadAllCommands(): Promise<Command[]> {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'));

  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push(command.default);
  }

  return commands;
}
