import { Client as DiscordClient } from 'discord.js';
import { IntentHandler } from '../src/modules/intent-inference/intent-handler';
import { ReminderHandler } from '../src/modules/reminders/reminders';

declare global {
  namespace Amber {
    export type Client = DiscordClient & {
      reminders: ReminderHandler;
      intents: IntentHandler;
      isMentioningBot: (message: Message) => boolean;
    };
  }
}
