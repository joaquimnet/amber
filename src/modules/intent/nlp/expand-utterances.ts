// @ts-expect-error - no types
import intentUtteranceGenerator from 'intent-utterance-generator';

/*

Will parse messages such as:
request.weather (give me the|show me|what's the|what is the|tell me) (weather|weather like|weather today|weather like today|temperature)
and expand into:
request.weather give me the weather
request.weather give me the temperature
request.weather show me weather
request.weather what's the weather like
...
*/

export function expandUtterances(input: string): string {
  const [intent, utterance] = [input.split(' ')[0], input.split(' ').slice(1).join(' ')];

  const intents = {
    [intent]: [utterance],
  };

  return intentUtteranceGenerator(intents).toString();
}
