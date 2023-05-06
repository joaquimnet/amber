import { Message } from 'discord.js';
import { Command } from '../command';
import { expandUtterances } from '../../intent/nlp/expand-utterances';
import { splitMessage } from '../../util/discord';

class IntentCommand extends Command {
  constructor() {
    super({ name: 'intent' });
  }

  async execute(message: Message, args: string) {
    const utterances = expandUtterances(args);

    for (const msg of splitMessage(utterances)) {
      if (msg) await message.reply(msg);
    }
  }
}

export default new IntentCommand();
