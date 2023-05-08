import { Schema, model, Document } from 'mongoose';

export interface IGuildPreferences {
  guildId: string;
  conversation: {
    allowedChannels: string[];
  };
  settings: {
    prefix: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const guildPreferencesSchema = new Schema<IGuildPreferences>(
  {
    guildId: {
      type: String,
      required: true,
    },
    conversation: {
      allowedChannels: {
        type: [String],
        required: true,
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

export interface GuildPreferencesDocument extends IGuildPreferences, Document {}

export const GuildPreferences = model<IGuildPreferences>('GuildPreferences', guildPreferencesSchema);
