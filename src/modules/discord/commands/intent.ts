import { Message } from 'discord.js';
import { expandUtterances } from '../../awareness/intent/nlp/expand-utterances';
import { splitMessage } from '../../core/util/discord';
import { Command } from '../command';

class IntentCommand extends Command {
  constructor() {
    super({ name: 'intent' });
  }

  async execute(message: Message, args: string) {
    const utterances = expandUtterances(args);

    for (const msg of splitMessage(utterances)) {
      await message.reply(msg);
    }
  }
}

export default new IntentCommand();
