import { TransactionReceipt } from '../TransactionReceipt';

interface EventData {
  name: string;
  parameters: any[];
}

class EventManager {
  private events: Map<string, Set<(data: EventData) => void>> = new Map();

  registerEvent(name: string, callback: (data: EventData) => void) {
    if (!this.events.has(name)) {
      this.events.set(name, new Set());
    }
    this.events.get(name)!.add(callback);
  }

  emitEvent(name: string, parameters: any[]) {
    const eventData: EventData = { name, parameters };
    if (this.events.has(name)) {
      for (const callback of this.events.get(name)!) {
        callback(eventData);
      }
    }
    this.storeEvent(eventData);
  }

  private storeEvent(eventData: EventData) {
    // Store event data in the current transaction receipt
    TransactionReceipt.addEvent(eventData);
  }
}

export const eventManager = new EventManager();