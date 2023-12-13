import { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { Core } from '../core/bot';
import { logger } from '../../log';
import { commands } from '../read-command-files';
import { parseInteractionId } from '../core/interaction';
import { interactions } from '../read-interaction-files';

const uhOh = '🥺 Something went wrong, please try again later.';

export async function onInteractionCreate(interaction: Interaction) {
  const guildPreferences = await Core.getGuildPreferences(interaction.guildId!);

  // commands handling

  if (interaction.isCommand()) {
    const { commandName } = interaction;

    const command = commands.find((c) => c.name === commandName);

    if (!command) {
      logger.warn(`Command ${commandName} not found`);
      await interaction.reply({ content: 'Command not found', ephemeral: true });
      return;
    }

    try {
      logger.debug(`User ${interaction.user.globalName} executes command ${commandName}`);
      await command.execute(
        interaction,
        interaction.options as ChatInputCommandInteraction['options'],
        guildPreferences,
      );
    } catch (err) {
      logger.error(err);
      await interaction.reply({ content: uhOh, ephemeral: true });
    }

    if (!interaction.replied) {
      await interaction.reply({ content: 'Done!', ephemeral: true });
    }

    return;
  }

  // interactions handling

  const parsedInteractionId = parseInteractionId(interaction);
  const handler = interactions.get(parsedInteractionId.name);
  if (!handler) {
    logger.error(`User ${interaction.user.globalName} used an unknown interaction: ${parsedInteractionId.name}`);
    if ('reply' in interaction) {
      await interaction.reply({ content: uhOh, ephemeral: true });
    }
    return;
  }

  try {
    logger.debug(`User ${interaction.user.globalName} executes interaction ${handler?.name}`);
    await handler?.execute(interaction, parsedInteractionId.payload, guildPreferences);
  } catch (err) {
    logger.error(err);
    if ('reply' in interaction) {
      await interaction.reply({ content: uhOh, ephemeral: true });
    }
  }
}
