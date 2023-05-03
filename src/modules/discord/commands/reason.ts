import { Message } from 'discord.js';
import { Command } from '../command';
import { events } from '../../core/event-emitter/event-emitter';

class ReasonCommand extends Command {
  constructor() {
    super({ name: 'reason' });
  }

  async execute(message: Message, args: string) {
    const json = await events.emitAsync('reason:resolve-task', args);

    const content = '```json\n' + JSON.stringify(json[0], null, 2) + '\n```';
    message.reply(content);
  }
}

export default new ReasonCommand();
