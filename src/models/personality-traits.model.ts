import { Schema, model } from 'mongoose';

export interface IPersonalityTrait {
  _id: string;
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

// static methods
personalityTraitSchema.statics.getUserTraits = async function (userId: string) {
  return this.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $group: {
        _id: '$userId',
        traits: {
          $push: {
            k: '$trait',
            v: '$value',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        traits: {
          $arrayToObject: '$traits',
        },
      },
    },
  ]);
};

export interface PersonalityTraitDocument extends IPersonalityTrait, Document {
  getUserTraits(userId: string): Promise<{ [trait: string]: string[] }>;
}

export const PersonalityTrait = model<IPersonalityTrait>('PersonalityTrait', personalityTraitSchema);
