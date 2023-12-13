// @ts-nocheck (ignoring all type warnings from this file, as it's a test file)

import { Chat, ChatMessage } from './chat';
import { Types } from 'mongoose';
import { OpenAIRoles } from '../openai/types';
import { UserInteraction } from '../../models';
import persona from '../../persona';

jest.mock('../../models', () => ({
  UserInteraction: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('Chat', () => {
  let chat: Chat;
  const userId = 'user123';

  beforeEach(() => {
    chat = new Chat(userId);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMessages', () => {
    it('should update the current user interaction context', async () => {
      const messages: ChatMessage[] = [
        new ChatMessage(OpenAIRoles.USER, 'Hello', new Date()),
        new ChatMessage(OpenAIRoles.ASSISTANT, 'Hi there!', new Date()),
      ];

      const currentUserInteraction = {
        context: [],
        save: jest.fn(),
      };

      jest.spyOn(UserInteraction, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(UserInteraction, 'create').mockResolvedValueOnce(currentUserInteraction);

      await chat.addMessages(messages);

      expect(currentUserInteraction.context).toEqual(chat.messages);
      expect(currentUserInteraction.save).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset the chat messages and generate a new id', () => {
      chat.messages = [
        new ChatMessage(OpenAIRoles.USER, 'Hello', new Date()),
        new ChatMessage(OpenAIRoles.ASSISTANT, 'Hi there!', new Date()),
      ];

      chat.reset();

      expect(chat.messages).toEqual([]);
      expect(chat['id']).not.toBeUndefined();
    });
  });

  describe('formatForOpenAI', () => {
    it('should format chat messages for OpenAI', () => {
      chat.messages = [
        new ChatMessage(OpenAIRoles.USER, 'Hello', new Date()),
        new ChatMessage(OpenAIRoles.ASSISTANT, 'Hi there!', new Date()),
      ];

      const formattedMessages = chat.formatForOpenAI();

      expect(formattedMessages).toEqual([
        { role: OpenAIRoles.USER, content: 'Hello' },
        { role: OpenAIRoles.ASSISTANT, content: 'Hi there!' },
      ]);
    });
  });

  describe('generateId', () => {
    it('should generate a valid id', () => {
      const id = chat['generateId']();

      expect(Types.ObjectId.isValid(id)).toBe(true);
    });
  });
});
