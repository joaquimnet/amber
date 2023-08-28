import { Message } from 'discord.js';
import { events } from '../events';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';

interface CommandOptions {
  name: string;
  description?: string;
}

export abstract class Command {
  public name: string;
  public description?: string;

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    events.on('discord:command:' + this.name, this.execute.bind(this));
  }

  abstract execute(message: Message, args: string, guildPreferences: GuildPreferencesDocument): void;

  help(guildPreferences: GuildPreferencesDocument) {
    return `**${this.name}**\n?${this.name}`;
  }
}
