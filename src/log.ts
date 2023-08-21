import pc from 'picocolors';

export const logger = {
  debug: (...msg: any[]) => console.log(pc.gray('debug:'), ...msg),
  info: (...msg: any[]) => console.log(pc.green('info:'), ...msg),
  warn: (...msg: any[]) => console.log(pc.yellow('warn:'), ...msg),
  error: (...msg: any[]) => console.log(pc.red('error:'), ...msg),
};
