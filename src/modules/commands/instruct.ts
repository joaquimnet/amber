import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { BotCommand, CommandInteractionOptions } from '../core/command';
import { openAIService } from '../openai/openai';

class InstructCommand extends BotCommand {
  constructor() {
    super({
      name: 'instruct',
      description: 'Instructs the bot to generate or say something.',
      options: [
        {
          name: 'message',
          description: 'The message to generate or say.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
  }

  async execute(interaction: CommandInteraction, options: CommandInteractionOptions) {
    await interaction.deferReply({ ephemeral: true });

    const result = await openAIService.contextlessDavinciCompletion(options.getString('message')!);

    await interaction.editReply({
      content: '```' + JSON.stringify(JSON.parse(result.choices[0].text), null, 2) + '```',
      allowedMentions: { parse: [] },
    });
  }

  override help() {
    return `**${this.name}**\n?${this.name} [message]`;
  }
}

export default new InstructCommand();
