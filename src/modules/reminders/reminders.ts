import { Message, TextChannel } from 'discord.js';
import nodeSchedule from 'node-schedule';
import * as chrono from 'chrono-node';
import { IReminder, Reminder } from '../../models';
import { openAIService } from '../openai/openai';
import { OpenAIRoles } from '../openai/types';
import { bot } from '../../bot';
import axios from 'axios';
import { NOTIFICATIONS_TOPIC } from '../../config';

// TODO: this file should not interact with the discord api, only database and scheduler

export class ReminderHandler {
  constructor() {
    this.scheduleExistingReminders();
  }

  private async scheduleExistingReminders() {
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

    axios.post('https://ntfy.sh/' + NOTIFICATIONS_TOPIC, `Reminder: ${reminder.content}`, {
      headers: {
        Icon: 'https://media.discordapp.net/ephemeral-attachments/1182820656446976032/1182838809616986212/b95ba7ab8d246d207b275ea1753169fe.webp?ex=6586277c&is=6573b27c&hm=04874a48b55e802114795c3713d51834db16843cf31c8d71f601a9cb7eadc951&=&format=webp&width=115&height=115',
        Title: 'Amber',
        Priority: '3',
        Tags: 'calendar',
        Click: channel.url,
      },
    });
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
