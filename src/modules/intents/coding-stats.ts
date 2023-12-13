import { Message } from 'discord.js';
import { wakatimeService } from '../sources/wakatime/wakatime.service';
import { BotIntent } from '../core/intent';

// TODO: convert to IntentCommand and move to the intents folder

class CodingStatsIntent extends BotIntent {
  static INTENT = 'codingstats.show';

  constructor() {
    super({ name: CodingStatsIntent.INTENT });
  }

  async execute(message: Message) {
    const summary = await wakatimeService.getSummaryToday();

    let msg = `__Wakatime Today__\nTotal: ${summary.cumulative_total.text}\n\n`;

    summary.data[0].projects.sort((a: any, b: any) => b.total_seconds - a.total_seconds);

    for (const project of summary.data[0].projects) {
      msg += `**${project.name}**: ${project.text}\n`;
    }

    msg += `\n**Languages**\n`;

    summary.data[0].languages.sort((a: any, b: any) => b.total_seconds - a.total_seconds);

    for (let i = 0; i < 2; i++) {
      if (summary.data[0].languages[i]) {
        msg += `**${summary.data[0].languages[i].name}**: ${summary.data[0].languages[i].text}\n`;
      }
    }

    await message.channel.send(msg);

    // return [
    //   {
    //     author: OpenAIRoles.USER,
    //     content: message.content,
    //     timestamp: message.createdAt,
    //   },
    //   {
    //     author: OpenAIRoles.ASSISTANT,
    //     content: msg,
    //     timestamp: new Date(),
    //   },
    // ];
  }
}

export default new CodingStatsIntent();
