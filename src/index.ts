import pc from 'picocolors';
import { config } from 'dotenv';
config();
import { enabledModules } from './ember';
import { bot } from './bot';
import './modules/core/cron';
import { connect } from './database';
import { logger } from './log';

const version = process.env['npm_package_version']!;

bot;
connect().then(() => {
  logger.info(`Ember v${version}`);
  console.log(pc.bold('Ember Modules'));
  for (const [key, value] of Object.entries(enabledModules)) {
    console.log(`${key.split('_')[0]}: ${[pc.red('off'), pc.cyan('on')][Number(value)]}`);
  }
  logger.info('Connected to database');
});
