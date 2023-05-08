import { Message, TextChannel } from 'discord.js';
import { IOperationalLog, OperationalLog } from '../../models';
import persona from '../../persona';
import { ConversationCommand } from './commands/conversation-command';
import { events } from '../events';
import { Module, ModuleStatus } from '../module';
import conversationModule from './conversation-module';
import { OpenAIRoles } from '../openai/types';
import { bot } from '../../bot';

const nicknameRegex = new RegExp(`\\b(${persona.nicknames.join('|')})\\b`, 'gi');
const isMentioningBot = (message: Message) => message.mentions.users.has(bot.user!.id);
const dismissalRegex = new RegExp(
  `^(bye|goodbye|see\\s?you|catch\\s?you)\\s*(later|soon|!|\\?)*\\s*(${persona.nicknames.join('|')})*$`,
);

class ConversationFlowModule extends Module {
  name = 'ConversationFlow';
  status: ModuleStatus = ModuleStatus.ENABLED;
  dependencies?: Module[] | undefined = [conversationModule];

  init(): void {
    events.on('awareness:conversation:flow:handle-conversation', this.handleConversation.bind(this), {
      promisify: true,
    });
  }

  async handleConversation(message: Message, conversationCommand?: ConversationCommand) {
    if (conversationCommand) {
      await this._handleConversationCommand(message, conversationCommand);
      return;
    }

    // add check to see if this is a registered channel for Ember conversations

    const autoChatHandled = await this._handleAutoChat(message);
    if (autoChatHandled) return;

    const context = await conversationModule.getContext(message.author.id);

    const isCallingEmber = nicknameRegex.test(message.content) || isMentioningBot(message);
    const isDismissingEmber = message.content.toLowerCase().match(dismissalRegex);
    const hasExistingConversation = context.messages.filter((m) => m.author !== OpenAIRoles.ASSISTANT).length > 0;

    if (hasExistingConversation && isDismissingEmber) {
      await this._conversationDismiss(message);
      return;
    }

    if (!hasExistingConversation && !isCallingEmber) return;

    await this._conversationBegin(message);
  }

  private async _handleConversationCommand(message: Message, conversationCommand: ConversationCommand) {
    const chats = await conversationCommand.execute(message);

    if (chats) {
      await conversationModule.conversationAdd(message.author.id, chats);
    }
  }

  private async _conversationBegin(message: Message) {
    const context = await conversationModule.getContext(message.author.id);

    await conversationModule.conversationAdd(message.author.id, [
      {
        timestamp: new Date(),
        author: OpenAIRoles.USER,
        content: message.content,
      },
    ]);

    await message.channel.sendTyping();
    await conversationModule.respond(
      message.author.id,
      message.member?.nickname || message.author.username,
      context,
      message.channel as TextChannel,
    );
  }

  private async _conversationDismiss(message: Message) {
    const context = await conversationModule.getContext(message.author.id);

    await conversationModule.conversationAdd(message.author.id, [
      {
        timestamp: new Date(),
        author: OpenAIRoles.USER,
        content: message.content,
      },
    ]);

    await message.channel.sendTyping();
    await conversationModule.respond(
      message.author.id,
      message.member?.nickname || message.author.username,
      context,
      message.channel as TextChannel,
    );
    await conversationModule.conversationEnd(message.author.id);
  }

  private async _handleAutoChat(message: Message): Promise<boolean> {
    // Checking if user is responding to an auto chat
    const latestAutoChatInThisChannel = await OperationalLog.findOne({
      'meta.discordChannelId': message.channel.id,
    }).sort({ createdAt: -1 });

    if (latestAutoChatInThisChannel) {
      const last2MessagesInChannel = message.channel.messages.cache.last(2);
      const channelHasMessages =
        last2MessagesInChannel && Array.isArray(last2MessagesInChannel) && last2MessagesInChannel.length === 2;

      if (channelHasMessages) {
        const possibleEmberAutoChat = last2MessagesInChannel[0];
        const isResponseToAutoChat = latestAutoChatInThisChannel.meta.discordMessageId === possibleEmberAutoChat.id;
        if (isResponseToAutoChat) {
          await this.handleAutoChatStarter(message, latestAutoChatInThisChannel);
          return true;
        }
      }
    }

    return false;
  }

  private async handleAutoChatStarter(message: Message, chat: IOperationalLog) {
    const context = await conversationModule.getContext(message.author.id);

    // this implementation of passing ContextMessage[] is dependent on the developer knowing the schema of ContextMessage
    // TODO: create a type for ContextMessage and use that instead of passing an array of objects
    await conversationModule.conversationAdd(message.author.id, [
      {
        timestamp: new Date(),
        author: OpenAIRoles.ASSISTANT,
        content: chat.message!,
      },
    ]);

    await message.channel.sendTyping();
    await conversationModule.respond(
      message.author.id,
      message.member?.nickname || message.author.username,
      context,
      message.channel as TextChannel,
    );
  }
}

export default new ConversationFlowModule();
