import { Message } from 'discord.js';
import { events } from '../core/event-emitter/event-emitter';

interface CommandOptions {
  name: string;
}

export abstract class Command {
  public name: string;

  constructor(options: CommandOptions) {
    this.name = options.name;
    events.on('discord:command:' + this.name, this.execute.bind(this));
  }

  abstract execute(message: Message, args: string): void;
}
