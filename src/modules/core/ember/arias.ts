import EventEmitter2 from 'eventemitter2';

// Ember's ARIAS
//
// Autonomy: Ember will independently perform actions
// Reasoning: Ember will make decisions based on context
// Improvement: Ember analyze historic data to help the user with their self-improvement
// Awareness: Ember will be aware of the user, the context, the environment and interactions
// Self: Ember will be aware of its systems and try to correct any errors

export abstract class ARIAS {
  constructor(public events: EventEmitter2) {}

  abstract registerEvents(): void;
}
