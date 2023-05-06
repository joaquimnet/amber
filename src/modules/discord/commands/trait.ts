import { Message } from 'discord.js';
import { Command } from '../command';
import { PersonalityTrait } from '../../../models/personality-traits.model';
import { splitMessage } from '../../util/discord';

class TraitCommand extends Command {
  constructor() {
    super({ name: 'trait' });
  }

  async execute(message: Message, args: string) {
    const [subCommand, userId, trait, ...value] = args.split(' ');

    if (subCommand === 'show' || !userId) {
      await this.show(message);
      return;
    }

    if (!trait) {
      await message.reply('You must provide a trait');
      return;
    }

    if (subCommand === 'add') {
      await this.add(message, trait, value);
      return;
    }

    if (subCommand === 'delete') {
      await this.delete(message, trait, value);
      return;
    }
  }

  private async show(message: Message) {
    const traits = (await (PersonalityTrait as any).getUserTraits(message.author.id || message.author.id))[0]
      ?.traits as Record<string, string[]>;
    console.log('traits: ', traits);

    const traitList = Object.entries(traits).map(([trait, values]) => {
      return `${trait}: ${values.join(', ')}`;
    });

    const messages = splitMessage(traitList.join('\n'));

    for (const msg of messages) {
      if (msg) await message.reply(msg);
    }

    return;
  }

  private async add(message: Message, trait: string, value: string[]) {
    if (!value) {
      await message.reply('You must provide a value');
      return;
    }

    const traitValue = value.join(' ');

    const existingTrait = await PersonalityTrait.findOne({ userId: message.author.id, trait });

    if (existingTrait) {
      if (!existingTrait.value.includes(traitValue)) {
        existingTrait.value.push(traitValue);
      }
      await existingTrait.save();
    } else {
      await PersonalityTrait.create({
        message: message.author.id,
        trait,
        value: [traitValue],
      });
    }

    await message.react('👍');
  }

  private async delete(message: Message, trait: string, value: string[]) {
    if (!value) {
      await message.reply('You must provide a value');
      return;
    }

    const traitValue = value.join(' ');

    const existingTrait = await PersonalityTrait.findOne({ userId: message.author.id, trait });

    if (existingTrait) {
      existingTrait.value = existingTrait.value.filter((v) => v !== traitValue);
      await existingTrait.save();
    }

    await message.react('👍');
  }
}

export default new TraitCommand();
