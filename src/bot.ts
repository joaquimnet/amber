import { discord } from './config';
import { ChatInputCommandInteraction, Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { ConversationCommand } from './modules/conversation/commands/conversation-command';
import { logger } from './log';
import { events } from './modules/events';
import { resolveIntent } from './modules/intent/resolve-intent';
import conversationFlowModule from './modules/conversation/conversation-flow-module';
import { commands, loadAllCommands } from './modules/discord';
import { GuildPreferences } from './models/guild-pereferences.model';
import { registerCommandsWithDiscord } from './modules/discord/register-commands-with-discord';

const bot = new Client({
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

bot.once(Events.ClientReady, (c) => {
  logger.info(`Ready! Logged in as ${c.user.tag}`);
});

bot.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const guildPreferences = await GuildPreferences.findOneAndUpdate(
    { guildId: message.guildId },
    { guildId: message.guildId },
    { upsert: true, new: true },
  );

  const channelId = message.channelId;
  const isConversationChannel = guildPreferences?.conversation.allowedChannels.includes(channelId);
  const noConversationChannelsRegistered = guildPreferences?.conversation.allowedChannels.length === 0;
  const isBotMentioned = message.mentions.users.has(bot.user!.id);

  // mentioning the bot when there is no conversation channel registered
  if (noConversationChannelsRegistered && isBotMentioned) {
    await message.reply(
      "I'm not allowed to talk in the server yet. Please ask an admin to register a conversation channel using the `?chat` command.",
    );
    return;
  }

  // not a conversation channel and not mentioning the bot
  // the !isBotMentioned check is to allow conversation outside conversation channels if the user is explicitly mentioning the bot
  if (!isConversationChannel && !isBotMentioned) {
    console.log('not a conversation channel and not mentioning the bot');
    return;
  }

  // Known Intents
  const intent = await resolveIntent(message);

  if (intent && !(intent instanceof ConversationCommand)) {
    events.emit('awareness:intent:' + intent, message);
    return;
  }

  // Conversation
  await conversationFlowModule.handleConversation(message, intent as ConversationCommand);
});

bot.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const guildPreferences = await GuildPreferences.findOneAndUpdate(
    { guildId: interaction.guildId },
    { guildId: interaction.guildId },
    { upsert: true, new: true },
  );

  const command = commands.find((c) => c.name === commandName);

  if (!command) {
    logger.warn(`Command ${commandName} not found`);
    await interaction.reply({ content: 'Command not found', ephemeral: true });
    return;
  }

  try {
    logger.debug(`User ${interaction.user.globalName} executes command ${commandName}`);
    await command.execute(interaction, interaction.options as ChatInputCommandInteraction['options'], guildPreferences);
  } catch (err) {
    logger.error(err);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }

  if (!interaction.replied) {
    await interaction.reply({ content: 'Done!', ephemeral: true });
  }
});

loadAllCommands().then((commands) => {
  logger.info(`Loaded ${commands.length} commands`);
  bot.login(discord.token).then(() => registerCommandsWithDiscord(bot));
});

export { bot };
