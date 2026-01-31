import { BloomFilter } from './bloom-filter';

interface EventData {
  [key: string]: any;
}

export class Event {
  name: string;
  data: EventData;

  constructor(name: string, data: EventData) {
    this.name = name;
    this.data = data;
  }
}

export class EventManager {
  private events: Event[] = [];
  private bloomFilter: BloomFilter;

  constructor() {
    this.bloomFilter = new BloomFilter();
  }

  emitEvent(event: Event): void {
    this.events.push(event);
    this.bloomFilter.add(event.name);
  }

  getEvents(filterBy?: string): Event[] {
    if (filterBy) {
      return this.events.filter(event => event.name === filterBy);
    }
    return this.events;
  }

  getEventsFromBloomFilter(topics: string[]): Event[] {
    return this.events.filter(event => topics.some(topic => this.bloomFilter.test(topic)));
  }
}