import cron from 'node-cron';
import { events } from '../event-emitter/event-emitter';

// - Minute: * * * * * (runs every minute)
cron.schedule('* * * * *', () => {
  console.log('running every minute');
  events.emit('cron:minute');
});

// - Hourly: 0 * * * * (runs every hour at the start of the hour, i.e. 1:00, 2:00, 3:00 etc.)
cron.schedule('0 * * * *', () => {
  console.log('running every hour');
  events.emit('cron:hourly');
});

// - Daily: 0 0 * * * (runs daily at 12:00 AM)
cron.schedule('0 0 * * *', () => {
  console.log('running every day at 12:00 AM');
  events.emit('cron:daily');
});

// - Weekly: 0 0 * * 0 (runs every Sunday at 12:00 AM)
cron.schedule('0 0 * * 0', () => {
  console.log('running every Sunday at 12:00 AM');
  events.emit('cron:weekly');
});

// - Monthly: 0 0 1 * * (runs on the first day of every month at 12:00 AM)
cron.schedule('0 0 1 * *', () => {
  console.log('running on the first day of every month at 12:00 AM');
  events.emit('cron:monthly');
});
