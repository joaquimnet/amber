import { Message, TextChannel } from 'discord.js';
import nodeSchedule from 'node-schedule';
import * as chrono from 'chrono-node';
import { IReminder, Reminder } from '../../models';
import { events } from '../events';
import { openAIService } from '../openai/openai';
import { OpenAIRoles } from '../openai/types';
import { bot } from '../../bot';
import { Module, ModuleStatus } from '../module';
import cron from '../cron';

class ReminderHandler extends Module {
  name = 'Reminders';
  status: ModuleStatus = ModuleStatus.ENABLED;
  dependencies?: Module[] | undefined = [cron];

  async init() {
    events.on('awareness:intent:reminders:add', this.onAddReminder.bind(this));
    events.on('reminders:fire', this.fireReminder.bind(this));

    const reminders = await Reminder.find({});
    for (const r of reminders) {
      this.scheduleReminder(r);
    }
  }

  async addReminder(userId: string, guildId: string, channelId: string, content: string, fireDate: Date) {
    const reminder = await Reminder.create({
      userId,
      guildId,
      channelId,
      content,
      fireDate,
    });

    await reminder.save();

    this.scheduleReminder(reminder);
  }

  scheduleReminder(reminder: IReminder) {
    nodeSchedule.scheduleJob(reminder.fireDate, async () => {
      this.fireReminder(reminder);
    });
  }

  async fireReminder(reminder: IReminder) {
    const channel = bot.guilds.cache.get(reminder.guildId)?.channels.cache.get(reminder.channelId) as TextChannel;

    if (channel) {
      channel.send(`:calendar: <@${reminder.userId}> Reminder!\n\n${reminder.content}`);
    }
  }

  async onAddReminder(message: Message) {
    const fireDate = chrono.parseDate(message.content, new Date(), {
      forwardDate: true,
    });

    const reminder = message.content.toLowerCase().substring(message.content.indexOf('to') + 2);

    await message.channel.sendTyping();

    await this.addReminder(message.author.id, message.guild!.id, message.channel.id, reminder, fireDate);

    const feedback = await openAIService.chatCompletion(
      [
        {
          role: OpenAIRoles.SYSTEM,
          content: `You just set a reminder for the user on ${fireDate} to ${reminder}. Notify the user that you saved the reminder.`,
        },
      ],
      message.author.id,
      message.member?.nickname || message.author.username,
    );

    await message.channel.send(feedback.choices[0].message.content);
  }
}

export const reminderHandler = new ReminderHandler();
