import { EmberConversationRoles, OpenAIRoles } from './types';

export class ContextMessage {
  constructor(public author: EmberConversationRoles, public content: string, public timestamp: Date) {}
}

export class ConversationContext {
  constructor(public userId: string, public messages: ContextMessage[] = []) {}

  addMessage(message: ContextMessage) {
    this.messages.push(message);
  }

  addMessages(messages: ContextMessage[]) {
    this.messages = this.messages.concat(messages);
  }

  formatForOpenAI() {
    return this.messages.map((m) => {
      return {
        role: this.authorToRole(m.author)!,
        content: m.content,
      };
    });
  }

  private authorToRole(author: EmberConversationRoles): OpenAIRoles {
    if (author === 'user') return OpenAIRoles.USER;
    if (author === 'ember') return OpenAIRoles.ASSISTANT;
    return OpenAIRoles.SYSTEM;
  }
}
