import { Events } from 'discord.js';
import { logger } from './log';
import { Core } from './modules/core/bot';
import { onMessageCreate } from './modules/events/message-create';
import { onInteractionCreate } from './modules/events/interaction-create';

const bot = Core.createClient();

bot.once(Events.ClientReady, (client) => {
  logger.info(`Ready! Logged in as ${client.user.tag}`);
});

// Conversation
bot.on(Events.MessageCreate, onMessageCreate);

// Commands
bot.on(Events.InteractionCreate, onInteractionCreate);

Core.registerCommands(bot);

export { bot };
