import { Message } from 'discord.js';
import { Command } from '../command';

class PingCommand extends Command {
  constructor() {
    super({ name: 'ping', description: 'Pings the bot.' });
  }

  execute(message: Message) {
    message.reply('pong');
  }
}

export default new PingCommand();
