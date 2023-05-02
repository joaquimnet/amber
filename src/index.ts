import pc from 'picocolors';
import { config } from 'dotenv';
config();
import { enabledModules } from './ember';
import { bot } from './bot';
import './modules/core/cron';
import { connect } from './database';

bot;
connect().then(() => {
  console.log(pc.bold('Ember Modules'));
  for (const [key, value] of Object.entries(enabledModules)) {
    console.log(`${key.split('_')[0]}: ${[pc.red('off'), pc.cyan('on')][Number(value)]}`);
  }
  console.log('Connected to database');
});
