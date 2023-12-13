import { Message, TextChannel } from 'discord.js';
import persona from '../../persona';
import { OpenAIRoles } from '../openai/types';
import { bot } from '../../bot';
import { GuildPreferencesDocument } from '../../models/guild-pereferences.model';
import { IUserInteraction, UserInteraction } from '../../models';
import { openAIService } from '../openai/openai';
import cron, { CronEvents } from '../cron';
import { Chat, ChatMessage } from './chat';
import { splitMessage } from '../util/discord';
import { conversation } from '../../config';
import { logger } from '../../log';

const nicknameRegex = new RegExp(`\\b(${persona.nicknames.join('|')})\\b`, 'gi');

const dismissalRegex = new RegExp(
  `.*\\b(bye|goodbye|see\\s?you|catch\\s?you)\\s*(later|soon|!|\\?)*\\s*(${persona.nicknames.join('|')})*\\b.*`,
  'i',
);

class ConversationHandler {
  chats = new Map<string, Chat>();

  constructor() {
    cron.on(CronEvents.MINUTE, this._periodicSummarization.bind(this), { promisify: true });
  }

  async handleDiscordMessage(message: Message, guildPreferences: GuildPreferencesDocument) {
    // add check to see if this is a registered channel for Amber conversations

    // const autoChatHandled = await this._handleAutoChat(message);
    // if (autoChatHandled) return;

    const context = await this.getChat(message.author.id);

    const isCallingAmber = nicknameRegex.test(message.content) || bot.isMentioningBot(message);
    const isDismissingAmber = message.content.toLowerCase().match(dismissalRegex);
    const hasExistingConversation = context.messages.filter((m) => m.author !== OpenAIRoles.ASSISTANT).length > 0;

    if (hasExistingConversation && isDismissingAmber) {
      await this.endConversation(message);
      return;
    }

    if (!hasExistingConversation && !isCallingAmber) {
      return;
    }

    // starting a conversation when someone says bye amber would be kinda silly
    if (isDismissingAmber) {
      return;
    }

    await this.conversationAdd(message);
  }

  getChat(userId: string) {
    const context = this.chats.get(userId);

    if (!context) {
      const newContext = new Chat(userId);
      this.chats.set(userId, newContext);
      return newContext;
    }

    return context;
  }

  async delete(userId: string) {
    this.chats.delete(userId);
  }

  private async conversationAdd(message: Message) {
    const chat = await this.getChat(message.author.id);

    await chat.addMessages([
      {
        timestamp: new Date(),
        author: OpenAIRoles.USER,
        content: message.content,
      },
    ]);

    // cull messages to keep context token count low
    this.contextLengthCull(chat);

    await message.channel.sendTyping();
    await this.respond(
      message.author.id,
      message.member?.nickname || message.author.displayName,
      chat,
      message,
    );
  }

  private async endConversation(message: Message) {
    const context = await this.getChat(message.author.id);

    await context.addMessages([
      {
        timestamp: new Date(),
        author: OpenAIRoles.USER,
        content: message.content,
      },
    ]);

    this.contextLengthCull(context);

    await message.channel.sendTyping();
    await this.respond(
      message.author.id,
      message.member?.nickname || message.author.username,
      context,
      message,
    );
    await this.chats.delete(message.author.id);
    await message.react('👋');
  }

  async respond(userId: string, username: string, context: Chat, message: Message) {
    const response = await openAIService.chatCompletion(context.formatForOpenAI(), userId, username, true);

    const responseText = response.choices[0].message.content;

    for (const msg of splitMessage(responseText)) {
      if (msg) await message.reply(msg);
    }

    await context.addMessages([
      {
        timestamp: new Date(),
        author: OpenAIRoles.ASSISTANT,
        content: responseText,
      },
    ]);

    this.contextLengthCull(context);
  }

  async remember(userId: string, interaction: IUserInteraction) {
    const context = this.getChat(userId);

    let summary = '';
    let date = new Date();
    if (interaction.summary) {
      summary = interaction.summary;
      date = interaction.updatedAt!;
    } else {
      summary = await this.summarize(interaction.userId, interaction.context);
      interaction.summary = summary;
      await (interaction as any).save();
    }

    context.messages.unshift(
      new ChatMessage(
        OpenAIRoles.SYSTEM,
        `This is the summary of a previous conversation you had with the user on ${date}:\n\n${summary}`,
        new Date(),
      ),
    );
  }

  private async _periodicSummarization() {
    // get all interactions older than 20 minutes
    const interactions = await UserInteraction.find({
      updatedAt: {
        $lte: new Date(Date.now() - 1000 * 60 * 20),
      },
      summary: {
        $exists: false,
      },
    }).limit(5);

    if (!interactions.length) {
      return;
    }

    for (const interaction of interactions) {
      const summary = await this.summarize(interaction.userId, interaction.context);

      interaction.summary = summary;
      await interaction.save();
    }
  }

  async summarize(userId: string, context: IUserInteraction['context']): Promise<string> {
    const dialogueMachine = context
      .map((ctx) => {
        return `**${ctx.author.replace('amber', 'assistant')}:** ${ctx.content}`;
      })
      .join('\n');

    const summary = await openAIService.instructionOrFeedback(
      `Summarize the conversation below in bullet points (Amber is the assistant's name):\n\n${dialogueMachine}`,
      userId,
    );

    return summary;
  }

  private contextLengthCull(context: Chat) {
    const totalCharacterLength = context.messages.reduce((acc, m) => acc + m.content.length, 0);

    if (totalCharacterLength > conversation.MAX_TOTAL_CHARACTER_LENGTH) {
      const messagesInContextReversed = [...context.messages].reverse();
      const newContext = [];

      let currentTotalCharacterLength = 0;

      for (const message of messagesInContextReversed) {
        if (currentTotalCharacterLength < conversation.MAX_TOTAL_CHARACTER_LENGTH) {
          newContext.push(message);
          currentTotalCharacterLength += message.content.length;
        }
      }

      context.messages = newContext.reverse();
    }
  }
}

export default new ConversationHandler();
