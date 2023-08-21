import { TextChannel } from 'discord.js';
import { ConversationContext, ContextMessage } from './conversation-context';
import { Module, ModuleStatus } from '../module';
import { events } from '../events';
import { IUserInteraction, UserInteraction } from '../../models';
import { splitMessage } from '../util/discord';
import { conversation } from '../../config';
import { logger } from '../../log';
import { OpenAIRoles } from '../openai/types';
import { openAIService } from '../openai/openai';

class ConversationModule extends Module {
  name = 'Conversation';
  status: ModuleStatus = ModuleStatus.ENABLED;
  dependencies?: Module[] | undefined;

  conversationContexts = new Map<string, ConversationContext>();

  init(): void {
    events.on('awareness:conversation:add', this.conversationAdd.bind(this), { promisify: true });
    events.on('awareness:conversation:end', this.conversationEnd.bind(this), { promisify: true });
    events.on('awareness:conversation:getContext:*', this.getContext.bind(this), { promisify: true });
    events.on('awareness:conversation:respond', this.respond.bind(this), { promisify: true });
    events.on('awareness:conversation:remember', this.remember.bind(this), { promisify: true });

    events.on('cron:minute', this._periodicSummarization.bind(this), { promisify: true });
  }

  getContext(userId: string) {
    const context = this.conversationContexts.get(userId);

    if (!context) {
      const newContext = new ConversationContext(userId);
      this.conversationContexts.set(userId, newContext);
      return newContext;
    }

    return context;
  }

  async conversationAdd(userId: string, messages: ContextMessage[]) {
    const context = this.getContext(userId);

    await context.addMessages(messages);

    // cull messages old messages and keep the context token count low
    this.contextAgeCull(context);
    this.contextLengthCull(context);
  }

  async conversationEnd(userId: string) {
    this.conversationContexts.delete(userId);
  }

  async respond(userId: string, username: string, context: ConversationContext, channel: TextChannel) {
    const response = await openAIService.chatCompletion(context.formatForOpenAI(), userId, username, true);

    const responseText = response.choices[0].message.content;

    for (const msg of splitMessage(responseText)) {
      if (msg) await channel.send(msg);
    }

    await this.conversationAdd(userId, [
      {
        timestamp: new Date(),
        author: OpenAIRoles.ASSISTANT,
        content: responseText,
      },
    ]);
  }

  async remember(userId: string, interaction: IUserInteraction) {
    const context = this.getContext(userId);
    await context.rememberPreviousConversation(interaction);
  }

  private contextLengthCull(context: ConversationContext) {
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

  private contextAgeCull(context: ConversationContext) {
    const now = new Date();
    const maxAgeDate = new Date(now.getTime() - conversation.MAX_AGE * 60000);

    const latestMessage = context.messages[context.messages.length - 1];

    if (latestMessage.timestamp < maxAgeDate) {
      logger.info(`Culling conversation context for user ${context.userId}.`, {
        meta: {
          userId: context.userId,
        },
      });

      context.reset();
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
}

export default new ConversationModule();
