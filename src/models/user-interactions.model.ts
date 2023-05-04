import { Schema, model } from 'mongoose';

interface IContextMessage {
  author: string;
  content: string;
  timestamp: Date;
}

export interface IUserInteraction {
  userId: string;
  context: IContextMessage[];
  contextId: string;
  summary?: string;
  meta: any;
}

const userInteractionSchema = new Schema<IUserInteraction>(
  {
    userId: {
      type: String,
      required: true,
    },
    context: {
      type: [
        {
          author: { type: String, required: true },
          content: { type: String, required: true },
          timestamp: { type: Date, required: true },
        },
      ],
      required: true,
    },
    contextId: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: false,
    },
    meta: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// context text index
userInteractionSchema.index({ 'context.content': 'text', summary: 'text' });

export interface UserInteractionDocument extends IUserInteraction, Document {}

export const UserInteraction = model<IUserInteraction>('UserInteraction', userInteractionSchema);
