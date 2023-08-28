import { Message } from 'discord.js';
import { Command } from '../command';
import { expandUtterances } from '../../intent/nlp/expand-utterances';
import fs from 'fs/promises';

class IntentCommand extends Command {
  constructor() {
    super({ name: 'intent', description: 'Debugging command that generates utterances for an intent.' });
  }

  async execute(message: Message, args: string) {
    const utterances = expandUtterances(args);

    await fs.writeFile(`./utterances_${Date.now()}.txt`, utterances);

    await message.reply('I saved the result to a file. ♥');
  }
}

export default new IntentCommand();
