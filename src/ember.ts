// Ember's ARIAS
//
// Autonomy
// Reasoning
// Improvement
// Awareness
// Self

import { events } from './modules/core/event-emitter/event-emitter';
import { Awareness } from './modules/awareness';
import { Reasoning } from './modules/reasoning';

const AUTONOMY_ENABLED = false;
const REASONING_ENABLED = true;
const IMPROVEMENT_ENABLED = false;
const AWARENESS_ENABLED = true;
const SELF_ENABLED = false;

if (AUTONOMY_ENABLED) {
  events.emit('autonomy:enabled');
}

if (REASONING_ENABLED) {
  new Reasoning(events).registerEvents();
  events.emit('reasoning:enabled');
}

if (IMPROVEMENT_ENABLED) {
  events.emit('improvement:enabled');
}

if (AWARENESS_ENABLED) {
  new Awareness(events).registerEvents();
  events.emit('awareness:enabled');
}

if (SELF_ENABLED) {
  events.emit('self:enabled');
}

export const enabledModules = {
  AUTONOMY_ENABLED,
  REASONING_ENABLED,
  IMPROVEMENT_ENABLED,
  AWARENESS_ENABLED,
  SELF_ENABLED,
};
