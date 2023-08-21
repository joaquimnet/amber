import './config';
import './bot';
import { connect } from './database';
import { logger } from './log';

const version = process.env['npm_package_version']!;

connect().then(() => {
  logger.info(`Amber v${version}`);
  logger.info('Connected to database');
});
