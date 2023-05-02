import { events } from '../../core/event-emitter/event-emitter';
import { openAIJsonTaskResolution } from './json/json-openai';

export function registerReasonEvents() {
  events.on(
    'reason:resolve-task',
    async (task: string) => {
      console.log('reason:resolve-task');
      const json = await openAIJsonTaskResolution(task, {
        userStatus: 'active',
        repositoryVisibility: 'private',
      });
      return JSON.parse(json);
    },
    { promisify: true },
  );
}
