import fs from 'fs';
import path from 'path';
import { Command } from './command';
import { InteractionHandler } from './interaction-handler';

export const commands: Command[] = [];
export const interactions: Map<string, InteractionHandler> = new Map();

export async function loadAllCommands() {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'));

  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push(command.default);
  }

  return commands;
}
export async function loadAllInteractions() {
  const interactionFiles = fs.readdirSync(path.join(__dirname, 'interactions'));

  for (const file of interactionFiles) {
    const interaction = await import(`./interactions/${file}`);
    interactions.set(interaction.default.name, interaction.default);
  }

  return interactions;
}
