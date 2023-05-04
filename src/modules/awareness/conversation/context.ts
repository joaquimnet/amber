import { IUserInteraction, UserInteraction } from '../../../models';
import { events } from '../../core/event-emitter/event-emitter';
import { EmberConversationRoles, OpenAIRoles } from './types';
import { Types } from 'mongoose';

export class ContextMessage {
  constructor(public author: EmberConversationRoles, public content: string, public timestamp: Date) {}
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
        role: this.authorToRole(m.author)!,
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
      summary = (await events.emitAsync('conversation:context:summarize', this.userId, interaction.context))[0];
      interaction.summary = summary;
      await (interaction as any).save();
    }

    this.messages.unshift(
      new ContextMessage(
        EmberConversationRoles.SYSTEM,
        `This is the summary of a previous conversation you had with the user on ${date}:\n\n${summary}`,
        new Date(),
      ),
    );
  }

  private authorToRole(author: EmberConversationRoles): OpenAIRoles {
    if (author === 'user') return OpenAIRoles.USER;
    if (author === 'ember') return OpenAIRoles.ASSISTANT;
    return OpenAIRoles.SYSTEM;
  }

  private generateId() {
    return new Types.ObjectId().toHexString();
  }
}
