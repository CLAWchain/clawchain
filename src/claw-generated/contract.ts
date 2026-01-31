import { Event, EventManager } from './event';

export class Contract {
  private eventManager: EventManager;

  constructor() {
    this.eventManager = new EventManager();
  }

  emit(eventName: string, data: { [key: string]: any }): void {
    const event = new Event(eventName, data);
    this.eventManager.emitEvent(event);
  }

  getEvents(filterBy?: string): Event[] {
    return this.eventManager.getEvents(filterBy);
  }

  getEventsFromBloomFilter(topics: string[]): Event[] {
    return this.eventManager.getEventsFromBloomFilter(topics);
  }
}