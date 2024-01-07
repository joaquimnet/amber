import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { BotCommand, CommandInteractionOptions } from '../core/command';

const pick = (options: string[]) => options[Math.floor(Math.random() * options.length)];

class PickCommand extends BotCommand {
  constructor() {
    super({
      name: 'pick',
      description: 'Pick one of the options provided.',
      options: [
        {
          name: 'options',
          description: 'The options to pick from.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
  }

  async execute(interaction: CommandInteraction, options: CommandInteractionOptions) {
    await interaction.channel?.sendTyping();

    const opts = options
      .getString('options')!
      .split(',')
      .map((option: string) => option.trim());

    await interaction.reply(`I pick ${pick(opts)}!`);
  }
}

export default new PickCommand();
