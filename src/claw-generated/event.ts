export interface Event {
  name: string;
  data: any;
}

export class EventEmitter {
  private events: Event[] = [];

  emit(name: string, data: any) {
    this.events.push({ name, data });
  }

  getEvents(): Event[] {
    return this.events;
  }
}