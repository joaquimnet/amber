import { IUserInteraction, UserInteraction } from '../../../models';
import { events } from '../../core/event-emitter/event-emitter';
import { openAIClient } from '../../core/openai/openai';
import { ContextMessage } from './context';

async function summarize(userId: string, context: IUserInteraction['context']) {
  const dialogueMachine = context
    .map((ctx) => {
      return `**${ctx.author.replace('ember', 'assistant')}:** ${ctx.content}`;
    })
    .join('\n');

  const summary = await openAIClient.instructionOrFeedback(
    `Summarize the conversation below in bullet points (Ember is the assistant's name):\n\n${dialogueMachine}`,
    userId,
  );

  return summary;
}

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
    const summary = await summarize(interaction.userId, interaction.context);

    interaction.summary = summary;
    await interaction.save();
  }
});

events.on(
  'conversation:context:summarize',
  async (userId: string, context: ContextMessage[]) => {
    const summary = await summarize(userId, context);

    return summary;
  },
  { promisify: true },
);
