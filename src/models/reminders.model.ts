import { Schema, model } from 'mongoose';

export interface IReminder {
  _id: string;
  userId: string;
  guildId: string;
  channelId: string;
  content: string;
  fireDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: String,
      required: true,
    },
    guildId: {
      type: String,
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    fireDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface ReminderDocument extends IReminder, Document {}

export const Reminder = model<IReminder>('Reminder', reminderSchema);
