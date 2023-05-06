import { Message } from 'discord.js';
import { Command } from '../command';
import { IUserInteraction, UserInteraction } from '../../../models';
import { openAIService } from '../../openai/openai';
import { splitMessage } from '../../util/discord';

class SummaryCommand extends Command {
  constructor() {
    super({ name: 'summary' });
  }

  async execute(message: Message, args: string) {
    const conversation = (await UserInteraction.findById(args.trim())) as IUserInteraction;

    if (!conversation) {
      return await message.reply(`No conversation found with id ${args.trim()}`);
    }

    const dialogueDisplay = conversation.context
      .map((context) => {
        // return `**${context.author.replace('ember', 'assistant')}:** ${context.content}`;
        return `**${context.author}:** ${context.content}`;
      })
      .join('\n');

    const dialogueMachine = conversation.context
      .map((context) => {
        // return `**${context.author.replace('ember', 'assistant')}:** ${context.content}`;
        return `**${context.author.replace('ember', 'assistant')}:** ${context.content}`;
      })
      .join('\n');

    const length = dialogueDisplay.length;

    const summary = await openAIService.instructionOrFeedback(
      `Summarize the conversation below in bullet points (Ember is the assistant's name):\n\n${dialogueMachine}`,
      message.author.id,
    );

    const msg = `**Summary:**\n\n${summary}\n\n**Original Conversation:**\n\n${dialogueDisplay}\n\n**Length:** ${length} characters`;

    for (const m of splitMessage(msg)) {
      if (m) await message.channel.send(m);
    }
  }
}

export default new SummaryCommand();
