import { Message } from 'discord.js';
import { Command } from '../command';

class PingCommand extends Command {
  constructor() {
    super({ name: 'ping' });
  }

  execute(message: Message) {
    message.reply('pong');
  }
}

export default new PingCommand();
