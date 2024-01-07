import { CommandInteraction } from 'discord.js';
import { BotCommand } from '../core/command';

class CoinflipCommand extends BotCommand {
  constructor() {
    super({ name: 'coinflip', description: 'Flips a coin.' });
  }

  async execute(interaction: CommandInteraction) {
    await interaction.channel?.sendTyping();

    const result = Math.random() < 0.5 ? 'heads' : 'tails';

    await interaction.reply(`It's ${result}!`);
  }
}

export default new CoinflipCommand();
