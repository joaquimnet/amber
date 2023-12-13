import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { discord } from '../../config';
import { logger } from '../../log';
import { loadAllCommands } from '../read-command-files';
import { loadAllInteractions } from '../read-interaction-files';
import { registerCommandsWithDiscord } from '../register-commands-with-discord';
import { GuildPreferences } from '../../models/guild-pereferences.model';
import { initModules } from '../../init-modules';
import { loadAllIntents } from '../read-intent-files';

// Application bot stuff: create client, load commands and interactions, register commands with discord.

export class Core {
  static createClient(): Amber.Client {
    const client = new Client({
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
      ],
    });

    return initModules(client);
  }

  static registerCommands(bot: Amber.Client) {
    Promise.all([loadAllCommands(), loadAllInteractions(), loadAllIntents()]).then(
      ([commands, interactions, intents]) => {
        logger.info(`Loaded ${commands.length} commands`);
        logger.info(`Loaded ${interactions.size} interactions`);
        logger.info(`Loaded ${intents.length} intents`);
        bot.intents.registerIntents(intents);
        bot.login(discord.token).then(() => registerCommandsWithDiscord(bot));
      },
    );
  }

  static getGuildPreferences(guildId: string) {
    return GuildPreferences.findOneAndUpdate({ guildId }, { guildId }, { upsert: true, new: true });
  }
}
