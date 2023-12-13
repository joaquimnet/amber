import { Types } from 'mongoose';
import { OpenAIRoles } from '../openai/types';
import { UserInteraction } from '../../models';
// import conversation from './conversation-module';
import persona from '../../persona';

// This module is not part of the main conversation module because in the future it will have very
// specific functionality regarding fetching the correct information from the database based on
// the content of the current conversation.

// TODO: Rename UserInteraction to ChatLog

export class ChatMessage {
  constructor(public author: OpenAIRoles, public content: string, public timestamp: Date) {}
}

export class Chat {
  private id: string;

  constructor(public userId: string, public messages: ChatMessage[] = []) {
    this.id = this.generateId();
  }

  async addMessages(messages: ChatMessage[]) {
    this.messages = this.messages.concat(this.replaceBotMentionWithBotName(messages));

    const currentUserInteraction = await this.findOrCreateCurrentUserInteraction(this.id);
    currentUserInteraction.context = this.messages;
    await currentUserInteraction.save();
  }

  private replaceBotMentionWithBotName(messages: ChatMessage[]) {
    return messages.map((m) => {
      return {
        ...m,
        content: m.content.replace(/<@!?\d+>/g, persona.name),
      };
    });
  }

  private async findOrCreateCurrentUserInteraction(id: string) {
    const currentUserInteraction = await UserInteraction.findOne({ contextId: id });
    if (currentUserInteraction) return currentUserInteraction;

    return UserInteraction.create({
      userId: this.userId,
      context: this.messages,
      contextId: id,
    });
  }

  reset() {
    this.messages = [];
    this.id = this.generateId();
  }

  formatForOpenAI() {
    return this.messages.map((m) => {
      return {
        role: m.author,
        content: m.content,
      };
    });
  }

  private generateId() {
    return new Types.ObjectId().toHexString();
  }
}
