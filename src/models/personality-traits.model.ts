import { Schema, model, Document } from 'mongoose';

export interface IPersonalityTrait {
  userId: string;
  trait: string;
  value: string[];
  keywords: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const personalityTraitSchema = new Schema<IPersonalityTrait>(
  {
    userId: {
      type: String,
      required: true,
    },
    trait: {
      type: String,
      required: true,
    },
    value: {
      type: [String],
      required: true,
    },
    keywords: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface PersonalityTraitDocument extends IPersonalityTrait, Document {}

export const PersonalityTrait = model<IPersonalityTrait>('PersonalityTrait', personalityTraitSchema);
