import { logger } from './log';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

import './config';
import './bot';
import { connect } from './database';

const version = process.env['npm_package_version']!;
const packageName = process.env['npm_package_name']!;
const packageNameFormatted = packageName[0].toUpperCase() + packageName.substring(1);

logger.info(`${packageNameFormatted} v${version}`);

connect().then(() => {
  logger.info('Connected to database');
});
