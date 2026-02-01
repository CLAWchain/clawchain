import { Event } from './event';

export class EventEmitter {
  private events: Event[] = [];

  emit(contractAddress: string, name: string, indexedParams: any[], unindexedParams: any[]) {
    const event = new Event(contractAddress, name, indexedParams, unindexedParams);
    this.events.push(event);
  }

  getEvents(): Event[] {
    return this.events;
  }
}