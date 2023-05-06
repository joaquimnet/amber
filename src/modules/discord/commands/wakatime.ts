import { Message } from 'discord.js';
import { Command } from '../command';
import { wakatimeService } from '../../sources/wakatime/wakatime.service';
import { inspect } from 'util';

class WakatimeCommand extends Command {
  constructor() {
    super({ name: 'wakatime' });
  }

  async execute(message: Message) {
    const summary = await wakatimeService.getSummaryToday();
    console.log(inspect(summary, false, null, true));
    await message.reply('I posted your wakatime summary to the console.');
  }
}

export default new WakatimeCommand();
