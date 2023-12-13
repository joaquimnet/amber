import { ApplicationCommandOptionType, AttachmentBuilder, CommandInteraction } from 'discord.js';
import { BotCommand, CommandInteractionOptions } from '../core/command';
import { commands } from '../read-command-files';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';
import { bot } from '../../bot';

class HelpCommand extends BotCommand {
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
      files: [new AttachmentBuilder(bot.application!.client.user.avatarURL()!)],
    });
  }

  override help() {
    return `**${this.name}**\n?${this.name} [command]`;
  }
}

export default new HelpCommand();
