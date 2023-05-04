import { Message } from 'discord.js';
import { Command } from '../command';
import { PersonalityTrait } from '../../../models/personality-traits.model';
import { splitMessage } from '../../core/util/discord';

class TraitCommand extends Command {
  constructor() {
    super({ name: 'trait' });
  }

  async execute(message: Message, args: string) {
    const [subCommand, userId, trait, ...value] = args.split(' ');

    if (subCommand === 'show' || !userId) {
      const traits = (await (PersonalityTrait as any).getUserTraits(userId || message.author.id))[0]?.traits as Record<
        string,
        string[]
      >;
      console.log('traits: ', traits);

      const traitList = Object.entries(traits).map(([trait, values]) => {
        return `${trait}: ${values.join(', ')}`;
      });

      const messages = splitMessage(traitList.join('\n'));

      for (const msg of messages) {
        await message.reply(msg);
      }

      return;
    }

    if (!trait) {
      await message.reply('You must provide a trait');
      return;
    }

    if (subCommand === 'add') {
      if (!value) {
        await message.reply('You must provide a value');
        return;
      }

      const traitValue = value.join(' ');

      const existingTrait = await PersonalityTrait.findOne({ userId, trait });

      if (existingTrait) {
        if (!existingTrait.value.includes(traitValue)) {
          existingTrait.value.push(traitValue);
        }
        await existingTrait.save();
      } else {
        await PersonalityTrait.create({
          userId,
          trait,
          value: [traitValue],
        });
      }

      await message.react('👍');
      return;
    }

    if (subCommand === 'delete') {
      if (!value) {
        await message.reply('You must provide a value');
        return;
      }

      const traitValue = value.join(' ');

      const existingTrait = await PersonalityTrait.findOne({ userId, trait });

      if (existingTrait) {
        existingTrait.value = existingTrait.value.filter((v) => v !== traitValue);
        await existingTrait.save();
      }

      await message.react('👍');
      return;
    }
  }
}

export default new TraitCommand();
