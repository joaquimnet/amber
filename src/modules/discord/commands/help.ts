import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Command, CommandInteractionOptions } from '../command';
import { commands } from '..';
import { GuildPreferencesDocument } from '../../../models/guild-pereferences.model';

class HelpCommand extends Command {
  constructor() {
    super({
      name: 'help',
      description: 'Lists all commands.',
      dmPermission: true,
      options: [
        {
          name: 'command',
          description: 'The command to get help for.',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    });
  }

  async execute(
    interaction: CommandInteraction,
    options: CommandInteractionOptions,
    guildPreferences: GuildPreferencesDocument,
  ) {
    const specificCommand = commands
      .filter((command) => command.enabled)
      .find((c) => c.name === options.getString('command')?.toLowerCase().trim());

    if (specificCommand) {
      await interaction.reply({
        content: specificCommand.help(guildPreferences),
        ephemeral: true,
      });
      return;
    }

    let help = commands.map((c) => `**${c.name}** ${c.description ?? ''}`).join('\n');
    help += '\nTo see more information about a specific command, type `/help [command]`.';
    await interaction.reply({
      content: help,
      ephemeral: true,
    });
  }

  override help() {
    return `**${this.name}**\n?${this.name} [command]`;
  }
}

export default new HelpCommand();
