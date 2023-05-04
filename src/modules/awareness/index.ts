import { ARIAS } from '../core/ember/arias';
import { registerConversationEvents } from './conversation';
import './logging/commands';

export class Awareness extends ARIAS {
  registerEvents() {
    registerConversationEvents();
  }
}
