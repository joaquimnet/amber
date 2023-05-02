import { ARIAS } from '../core/ember/arias';
import { registerConversationEvents } from './conversation';

export class Awareness extends ARIAS {
  registerEvents() {
    registerConversationEvents();
  }
}
