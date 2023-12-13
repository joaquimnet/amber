import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { BotCommand, CommandInteractionOptions } from '../core/command';
import { IUserInteraction, UserInteraction } from '../../models';
import { openAIService } from '../openai/openai';
import { splitMessage } from '../util/discord';

class SummaryCommand extends BotCommand {
  constructor() {
    super({
      name: 'summary',
      description: 'Summarizes a conversation.',
      options: [
        {
          name: 'conversation-id',
          description: 'The id of the conversation to summarize.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
  }

  async execute(interaction: CommandInteraction, options: CommandInteractionOptions) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const conversationId = options.getString('conversation-id')!;
    const conversation = (await UserInteraction.findById(conversationId)) as IUserInteraction;

    if (!conversation) {
      await interaction.editReply(`No conversation found with id ${conversationId}`);
      return;
    }

    const dialogueDisplay = conversation.context
      .map((context) => {
        return `**${context.author}:** ${context.content}`;
      })
      .join('\n');

    const dialogueMachine = conversation.context
      .map((context) => {
        return `**${context.author.replace('amber', 'assistant')}:** ${context.content}`;
      })
      .join('\n');

    const length = dialogueDisplay.length;

    const summary = await openAIService.instructionOrFeedback(
      `Summarize the conversation below in bullet points (Amber is the assistant's name):\n\n${dialogueMachine}`,
      interaction.user.id,
    );

    const msg = `**Summary:**\n\n${summary}\n\n**Original Conversation:**\n\n${dialogueDisplay}\n\n**Length:** ${length} characters`;

    for (const m of splitMessage(msg)) {
      if (m) await interaction.channel!.send(m);
    }

    await interaction.editReply('Done!');
  }

  override help() {
    return `**${this.name}**\n?${this.name} [conversation id]`;
  }
}

export default new SummaryCommand();
