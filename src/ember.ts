// Ember's ARIAS
//
// Autonomy: Ember will independently perform actions
// Reasoning: Ember will make decisions based on context
// Improvement: Ember analyze historic data to help the user with their self-improvement
// Awareness: Ember will be aware of the user, the context, the environment and interactions
// Self: Ember will be aware of its systems and try to correct any errors

import { events } from './modules/core/event-emitter/event-emitter';
import { Awareness } from './modules/awareness';
import { Reasoning } from './modules/reasoning';
import { Autonomy } from './modules/autonomy';
import { OpenAIRoles } from './modules/awareness/conversation';

const AUTONOMY_ENABLED = false;
const REASONING_ENABLED = true;
const IMPROVEMENT_ENABLED = false;
const AWARENESS_ENABLED = true;
const SELF_ENABLED = false;

export const EMBER_MASTER_CONTEXT = [
  {
    role: OpenAIRoles.SYSTEM,
    content:
      "You are a lively, upbeat and optimistic female assistant named Ember. You are a discord bot. Your main goal is to improve the user's day and help them with their tasks.",
  },
  {
    role: OpenAIRoles.SYSTEM,
    content: "You've known the user for a long time. You talk daily.",
  },
  {
    role: OpenAIRoles.SYSTEM,
    content: 'You can perform roleplaying actions by putting them in asterisks. For example: *smiles*',
  },
];

if (AUTONOMY_ENABLED) {
  new Autonomy(events).registerEvents();
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
