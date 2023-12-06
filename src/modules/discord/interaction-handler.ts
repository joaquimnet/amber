/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interaction } from 'discord.js';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';

interface InteractionHandlerOptions {
  name: string;
  enabled?: boolean;
}

export abstract class InteractionHandler {
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
    };
  }
}
