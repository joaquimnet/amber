import cron from 'node-cron';
import { Module, ModuleStatus } from '../module';
import { events } from '../events';

class CronModule extends Module {
  name = 'Cron';
  status = ModuleStatus.ENABLED;
  dependencies?: Module[] | undefined;

  init() {
    // - Minute: * * * * * (runs every minute)
    cron.schedule('* * * * *', () => {
      events.emit('cron:minute');
    });

    // - Hourly: 0 * * * * (runs every hour at the start of the hour, i.e. 1:00, 2:00, 3:00 etc.)
    cron.schedule('0 * * * *', () => {
      events.emit('cron:hourly');
    });

    // - Daily: 0 0 * * * (runs daily at 12:00 AM)
    cron.schedule('0 0 * * *', () => {
      events.emit('cron:daily');
    });

    // - Weekly: 0 0 * * 0 (runs every Sunday at 12:00 AM)
    cron.schedule('0 0 * * 0', () => {
      events.emit('cron:weekly');
    });

    // - Monthly: 0 0 1 * * (runs on the first day of every month at 12:00 AM)
    cron.schedule('0 0 1 * *', () => {
      events.emit('cron:monthly');
    });
  }
}

export default new CronModule();
