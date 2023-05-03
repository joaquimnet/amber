import { ARIAS } from '../core/ember/arias';
import { registerAutonomousUtterancesEvents } from './autonomous-utterances/autonomous-utterances';

export class Autonomy extends ARIAS {
  registerEvents() {
    registerAutonomousUtterancesEvents();
  }
}
