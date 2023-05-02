import { ARIAS } from '../core/ember/arias';
import { registerReasonEvents } from './system-task-reason/reason';

export class Reasoning extends ARIAS {
  registerEvents() {
    registerReasonEvents();
  }
}
