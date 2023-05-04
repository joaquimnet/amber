import { Message, TextChannel } from 'discord.js';
import nodeSchedule from 'node-schedule';
import { bot } from '../../../bot';
import { events } from '../event-emitter/event-emitter';
import { IReminder, Reminder } from '../../../models';
import { openAIClient } from '../openai/openai';
import { OpenAIRoles } from '../../awareness/conversation';
import * as chrono from 'chrono-node';

class ReminderHandler {
  constructor() {
    this.init();
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

  async init() {
    events.on('awareness:intent:reminders:add', async (message: Message) => {
      console.log('awareness:intent:reminders:add');
      const fireDate = chrono.parseDate(message.content, new Date(), {
        forwardDate: true,
      });

      const reminder = message.content.toLowerCase().substring(message.content.indexOf('to') + 2);

      await this.addReminder(message.author.id, message.guild!.id, message.channel.id, reminder, fireDate);

      const feedback = await openAIClient.chatCompletion(
        [
          {
            role: OpenAIRoles.SYSTEM,
            content: `You just set a reminder for the user on ${fireDate} to ${reminder}. Notify the user that you saved the reminder.`,
          },
        ],
        message.author.id,
      );

      await message.channel.send(feedback.choices[0].message.content);
    });

    events.on('reminders:fire', async (reminder: IReminder) => {
      console.log('reminders:fire', reminder._id);

      const channel = bot.guilds.cache.get(reminder.guildId)?.channels.cache.get(reminder.channelId) as TextChannel;

      if (channel) {
        channel.send(`:calendar: <@${reminder.userId}> Reminder!\n\n${reminder.content}`);
      }
    });

    const reminders = await Reminder.find({});
    for (const r of reminders) {
      this.scheduleReminder(r);
    }
  }

  scheduleReminder(reminder: IReminder) {
    nodeSchedule.scheduleJob(reminder.fireDate, async () => {
      events.emit('reminders:fire', reminder);
    });
  }
}

export const reminderHandler = new ReminderHandler();
