// @ts-expect-error - no types
import { NlpManager } from 'node-nlp';
import fs from 'fs';

const manager = new NlpManager({
  languages: ['en'],
  forceNER: true,
  nlu: { useNoneFeature: true },
  // surely this is fine
  autoSave: false,
});

interface NlpResponse {
  locale: string;
  utterance: string;
  settings?: any;
  languageGuessed: boolean;
  localeIso2: string;
  language: string;
  nluAnswer: {
    classifications: {
      intent: string;
      score: number;
    }[];
    entities?: any;
    explanation?: any;
  };
  classifications: {
    intent: string;
    score: number;
  }[];
  intent: string;
  score: number;
  domain: string;

  sourceEntities: {
    start: number;
    end: number;
    resolution: {
      values: {
        timex: string;
        value: string;
        type: string;
      }[];
    };
    text: string;
    typeName: string;
    entity: string;
  }[];

  entities: {
    start: number;
    end: number;
  }[];

  answers: any[];
  answer?: any;

  actions: any[];
  sentiment: {
    score: number;
    numWords: number;
    numHits: number;
    average: number;
    type: 'senticon';
    locale: 'en';
    ['vote']: 'positive' | 'negative';
  };
}

const data = fs
  .readFileSync(__dirname + '/utterances.txt', 'utf8')
  .trim()
  .split('\n')
  .map((line) => {
    const [intent, utterance] = [line.split(' ')[0].trim(), line.split(' ').slice(1).join(' ').trim()];
    return { intent, utterance };
  });

// Adds the utterances and intents for the NLP
for (const row of data) {
  manager.addDocument('en', row.utterance, row.intent);
}

(async () => {
  // for some reason if the model gets loaded it doesn't work. it has to be trained every time. surely this is fine, right...?
  await manager.train();

  // let msg = 'see you tomorrow';

  // let response: NlpResponse = await manager.process('en', msg);
  // // console.log(response);
  // // console.log(inspect(response, false, null, true));

  // console.log('-->', `"${msg}"`);
  // console.log('response.intent: ', response.intent);
  // console.log('response.score: ', response.score);

  // msg = 'ember remind me in 30 minutes to clock back in';
  // response = await manager.process('en', msg);
  // // console.log(response);
  // // console.log(inspect(response, false, null, true));

  // console.log('-->', `"${msg}"`);
  // console.log('response.intent: ', response.intent);
  // console.log('response.score: ', response.score);
  // console.log(response.classifications);

  // msg = "i'm going to play ffxiv tonight with some friends";
  // response = await manager.process('en', msg);
  // // console.log(response);
  // // console.log(inspect(response, false, null, true));

  // console.log('-->', `"${msg}"`);
  // console.log('response.intent: ', response.intent);
  // console.log('response.score: ', response.score);
  // console.log(response.classifications);

  // msg = "i hate how i can't find my keys, i always have to remind myself to put them in the same place every time i get home";
  // response = await manager.process('en', msg);
  // // console.log(response);
  // // console.log(inspect(response, false, null, true));

  // console.log('-->', `"${msg}"`);
  // console.log('response.intent: ', response.intent);
  // console.log('response.score: ', response.score);
  // console.log(response.classifications);
})();

export async function intentInference(input: string): Promise<{ intent: string | null; score: number }> {
  const response = await manager.process('en', input);
  if (response.intent === 'None') {
    response.intent = null;
  }
  return { intent: response.intent, score: response.score };
}
