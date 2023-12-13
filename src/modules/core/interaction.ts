/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interaction } from 'discord.js';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';

interface InteractionHandlerOptions {
  name: string;
  enabled?: boolean;
}

export abstract class BotInteraction {
  public name: string;
  public enabled: boolean;

  constructor(options: InteractionHandlerOptions) {
    this.name = options.name;
    this.enabled = options.enabled ?? true;
  }

  async execute(interaction: Interaction, args: string[], guildPreferences: GuildPreferencesDocument): Promise<void> {}

  toJSON() {
    return {
      name: this.name,
      enabled: this.enabled,
    };
  }
}
interface ParsedInteractionId {
  name: string;
  payload: string[];
}

export function parseInteractionId(interaction: Interaction): ParsedInteractionId {
  const customId = (interaction as any).customId || 'none:none';
  const [type, rest] = customId.split(':');
  const payload = rest.split(',');

  return { name: type, payload };
}

