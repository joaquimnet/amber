import { Message } from 'discord.js';
import { events } from '../events';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';

interface CommandOptions {
  name: string;
}

export abstract class Command {
  public name: string;

  constructor(options: CommandOptions) {
    this.name = options.name;
    events.on('discord:command:' + this.name, this.execute.bind(this));
  }

  abstract execute(message: Message, args: string, guildPreferences: GuildPreferencesDocument): void;
}
