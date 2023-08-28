import { Message } from 'discord.js';
import { Command } from '../command';
import { commands } from '..';
import { GuildPreferencesDocument } from '../../../models/guild-pereferences.model';

class HelpCommand extends Command {
  constructor() {
    super({ name: 'help', description: 'Shows this help message.' });
  }

  execute(message: Message, args: string, guildPreferences: GuildPreferencesDocument) {
    const specificCommand = commands.find((c) => c.name === args.toLowerCase().trim());

    if (specificCommand) {
      message.channel.send(specificCommand.help(guildPreferences));
      return;
    }

    let help = commands.map((c) => `**${c.name}** ${c.description ?? ''}`).join('\n');
    help += '\nTo see more information about a specific command, type `?help [command]`.';
    message.channel.send(help);
  }

  override help(guildPreferences: GuildPreferencesDocument) {
    return `**${this.name}**\n?${this.name} [command]`;
  }
}

export default new HelpCommand();
