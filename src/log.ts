import pc from 'picocolors';

const LOGLEVEL: number = parseInt(process.env.LOGLEVEL || '0', 10);

export const logger = {
  debug: (...msg: any[]) => {
    if (LOGLEVEL <= 0) {
      console.log(pc.gray('debug:'), ...msg);
    }
  },
  info: (...msg: any[]) => {
    if (LOGLEVEL <= 1) {
      console.log(pc.green('info:'), ...msg);
    }
  },
  warn: (...msg: any[]) => {
    if (LOGLEVEL <= 2) {
      console.log(pc.yellow('warn:'), ...msg);
    }
  },
  error: (...msg: any[]) => {
    if (LOGLEVEL <= 3) {
      console.log(pc.red('error:'), ...msg);
    }
  },
};
