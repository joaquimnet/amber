import './config';
import './bot';
import { connect } from './database';
import { logger } from './log';

const version = process.env['npm_package_version']!;
const packageName = process.env['npm_package_name']!;
const packageNameFormatted = packageName[0].toUpperCase() + packageName.substring(1);

connect().then(() => {
  logger.info(`${packageNameFormatted} v${version}`);
  logger.info('Connected to database');
});
