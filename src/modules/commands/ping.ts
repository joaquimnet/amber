import { CommandInteraction } from 'discord.js';
import { BotCommand } from '../core/command';

class PingCommand extends BotCommand {
  constructor() {
    super({ name: 'ping', description: 'Pings the bot.' });
  }

  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!');
  }
}

export default new PingCommand();
