import { Message } from 'discord.js';
import { Command } from '../command';
import { expandUtterances } from '../../intent/nlp/expand-utterances';
import fs from 'fs/promises';

class IntentCommand extends Command {
  constructor() {
    super({ name: 'intent' });
  }

  async execute(message: Message, args: string) {
    const utterances = expandUtterances(args);

    await fs.writeFile('./utterances.txt', utterances);

    await message.reply('I saved the result to a file. ♥');
  }
}

export default new IntentCommand();
