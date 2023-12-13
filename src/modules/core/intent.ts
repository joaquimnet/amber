/* eslint-disable @typescript-eslint/no-unused-vars */
import { Message } from 'discord.js';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';

interface IntentHandlerOptions {
  name: string;
  enabled?: boolean;
}

export abstract class BotIntent {
  public name: string;
  public enabled: boolean;

  constructor(options: IntentHandlerOptions) {
    this.name = options.name;
    this.enabled = options.enabled ?? true;
  }

  async execute(message: Message, guildPreferences: GuildPreferencesDocument): Promise<boolean|void> {}

  toJSON() {
    return {
      name: this.name,
      enabled: this.enabled,
    };
  }
}
