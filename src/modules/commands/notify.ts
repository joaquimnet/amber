import axios from 'axios';
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { BotCommand, CommandInteractionOptions } from '../core/command';
import { openAIService } from '../openai/openai';
import { NOTIFICATIONS_TOPIC } from '../../config';

class NotifyCommand extends BotCommand {
  constructor() {
    super({
      name: 'notify',
      description: 'Sends an Amber notification!',
      // dmPermission: false,
      // enabled: false,
      options: [
        {
          name: 'message',
          description: 'The message to send.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'priority',
          description: 'Notification priority.',
          type: ApplicationCommandOptionType.Integer,
          choices: [
            { name: 'Normal', value: 3 },
            { name: 'Important', value: 4 },
            { name: 'Urgent', value: 5 },
          ],
          required: true,
        },
      ],
    });
  }

  async execute(interaction: CommandInteraction, options: CommandInteractionOptions) {
    await interaction.channel?.sendTyping();

    let message = options.getString('message');
    let tags = undefined;
    let click = undefined;

    if (message === 'special:motivational') {
      message = await await openAIService.instructionOrFeedback(
        `Write a quick motivational quote that will be sent to this user in the form of a notification. The text must be short.`,
      );
      tags = 'heart';
      click = 'discord://https://discord.com/channels/1103910802160893956/1103918490022318140';
    }

    await axios.post('https://ntfy.sh/' + NOTIFICATIONS_TOPIC, message, {
      headers: {
        Icon: 'https://media.discordapp.net/ephemeral-attachments/1182820656446976032/1182838809616986212/b95ba7ab8d246d207b275ea1753169fe.webp?ex=6586277c&is=6573b27c&hm=04874a48b55e802114795c3713d51834db16843cf31c8d71f601a9cb7eadc951&=&format=webp&width=115&height=115',
        Title: 'Amber',
        Priority: String(options.getInteger('priority') || 3),
        Tags: tags,
        Click: click,
      },
    });

    await interaction.reply({
      content: 'Done!',
      ephemeral: true,
    });
  }
}

export default new NotifyCommand();
