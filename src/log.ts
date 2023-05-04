import { createLogger, MODE } from 'hanako';
import { hanako } from './config';

export const { logger } = createLogger({
  apiKey: hanako.HANAKO_API_KEY,
  app: hanako.HANAKO_APP,
  environment: hanako.HANAKO_ENVIRONMENT,
  hanakoServer: hanako.HANAKO_SERVER,
  mode: MODE.PRODUCTION,
});
