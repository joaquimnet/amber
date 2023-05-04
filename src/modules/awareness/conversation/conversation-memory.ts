import { UserInteraction } from '../../../models';
import { events } from '../../core/event-emitter/event-emitter';
import { openAIClient } from '../../core/openai/openai';

events.on('cron:minute', async () => {
  // get all interactions older than 20 minutes
  const interactions = await UserInteraction.find({
    updatedAt: {
      $lte: new Date(Date.now() - 1000 * 60 * 20),
    },
    summary: {
      $exists: false,
    },
  }).limit(5);

  if (!interactions.length) {
    return;
  }

  for (const interaction of interactions) {
    const dialogueMachine = interaction.context
      .map((context) => {
        // return `**${context.author.replace('ember', 'assistant')}:** ${context.content}`;
        return `**${context.author.replace('ember', 'assistant')}:** ${context.content}`;
      })
      .join('\n');

    const summary = await openAIClient.instructionOrFeedback(
      `Summarize the conversation below in bullet points (Ember is the assistant's name):\n\n${dialogueMachine}`,
      interaction.userId,
    );

    interaction.summary = summary;
    await interaction.save();
  }
});
