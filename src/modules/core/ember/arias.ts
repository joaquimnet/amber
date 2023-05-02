import EventEmitter2 from 'eventemitter2';

export abstract class ARIAS {
  constructor(public events: EventEmitter2) {}

  abstract registerEvents(): void;
}
