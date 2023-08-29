/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApplicationCommandOptionData,
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  Interaction,
} from 'discord.js';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';

interface CommandOptions {
  name: string;
  description: string;
  dmPermission?: boolean;
  options?: ApplicationCommandOptionData[];
  enabled?: boolean;
}

export type CommandInteractionOptions = ChatInputCommandInteraction['options'];

export abstract class Command {
  public name: string;
  public description: string;
  public dmPermission?: boolean;
  public options?: ApplicationCommandOptionData[];
  public enabled: boolean;

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.dmPermission = options.dmPermission;
    this.options = options.options;
    this.enabled = options.enabled ?? true;
  }

  async execute(
    interaction: CommandInteraction,
    options: CommandInteractionOptions,
    guildPreferences: GuildPreferencesDocument,
  ): Promise<void> {}

  help(guildPreferences: GuildPreferencesDocument) {
    return `**${this.name}**\n?${this.name}`;
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      dmPermission: this.dmPermission ?? false,
      options: this.options,
    };
  }
}
