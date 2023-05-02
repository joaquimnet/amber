import { config } from 'dotenv';
config();
import { enabledModules } from './ember';
import { bot } from './bot';

bot;
console.log(enabledModules);
