import EventEmitter2 from 'eventemitter2';
import cron from 'node-cron';

export enum CronEvents {
  MINUTE = 'cron:minute',
  HOURLY = 'cron:hourly',
  DAILY = 'cron:daily',
  WEEKLY = 'cron:weekly',
  MONTHLY = 'cron:monthly',
  YEARLY = 'cron:yearly',
  EVERY_5_MINUTES = 'cron:every-5-minutes',
}

export class Cron extends EventEmitter2 {
  constructor() {
    super({
      wildcard: true,
      delimiter: ':',
      maxListeners: 100,
    });

    cron.schedule('* * * * *', () => {
      this.emit(CronEvents.MINUTE);
    });

    cron.schedule('0 * * * *', () => {
      this.emit(CronEvents.HOURLY);
    });

    cron.schedule('0 0 * * *', () => {
      this.emit(CronEvents.DAILY);
    });

    cron.schedule('0 0 * * 0', () => {
      this.emit(CronEvents.WEEKLY);
    });

    cron.schedule('0 0 1 * *', () => {
      this.emit(CronEvents.MONTHLY);
    });

    cron.schedule('0 0 1 1 *', () => {
      this.emit(CronEvents.YEARLY);
    });

    cron.schedule('*/5 * * * *', () => {
      this.emit(CronEvents.EVERY_5_MINUTES);
    });
  }
}

export default new Cron();
