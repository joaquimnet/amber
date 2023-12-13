import { join } from 'path';
import { getFilesRecursively } from './util/fs';
import { BotInteraction } from './core/interaction';

export const interactions: Map<string, BotInteraction> = new Map();

export async function loadAllInteractions() {
  const interactionFiles = getFilesRecursively(join(__dirname, 'interactions'));

  for (const file of interactionFiles) {
    const interaction = await import(file);
    interactions.set(interaction.default.name, interaction.default);
  }

  return interactions;
}
