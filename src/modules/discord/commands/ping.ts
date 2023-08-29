import { CommandInteraction } from 'discord.js';
import { Command } from '../command';

class PingCommand extends Command {
  constructor() {
    super({ name: 'ping', description: 'Pings the bot.' });
  }

  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!');
  }
}

export default new PingCommand();
