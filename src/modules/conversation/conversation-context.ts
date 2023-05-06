import { Types } from 'mongoose';
import { OpenAIRoles } from '../openai/types';
import { IUserInteraction, UserInteraction } from '../../models';
import conversation from './conversation-module';

// This module is not part of the main conversation module because in the future it will have very
// specific functionality regarding fetching the correct information from the database based on
// the content of the current conversation.

export class ContextMessage {
  constructor(public author: OpenAIRoles, public content: string, public timestamp: Date) {}
}

export class ConversationContext {
  private id: string;
  constructor(public userId: string, public messages: ContextMessage[] = []) {
    this.id = this.generateId();
  }

  async addMessages(messages: ContextMessage[]) {
    this.messages = this.messages.concat(messages);

    const currentUserInteraction = await this.findOrCreateCurrentUserInteraction(this.id);
    currentUserInteraction.context = this.messages;
    await currentUserInteraction.save();
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

  async rememberPreviousConversation(interaction: IUserInteraction) {
    let summary = '';
    let date = new Date();
    if (interaction.summary) {
      summary = interaction.summary;
      date = interaction.updatedAt!;
    } else {
      summary = await conversation.summarize(interaction.userId, interaction.context);
      interaction.summary = summary;
      await (interaction as any).save();
    }

    this.messages.unshift(
      new ContextMessage(
        OpenAIRoles.SYSTEM,
        `This is the summary of a previous conversation you had with the user on ${date}:\n\n${summary}`,
        new Date(),
      ),
    );
  }

  private generateId() {
    return new Types.ObjectId().toHexString();
  }
}
