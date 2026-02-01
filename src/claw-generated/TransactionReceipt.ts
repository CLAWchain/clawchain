import { BloomFilter } from './utils/BloomFilter';

interface EventData {
  name: string;
  parameters: any[];
}

class TransactionReceipt {
  private events: EventData[] = [];
  private bloomFilter: BloomFilter;

  constructor() {
    this.bloomFilter = new BloomFilter();
  }

  static addEvent(eventData: EventData) {
    // Add the event to the current transaction receipt
    TransactionReceipt.instance.events.push(eventData);
    TransactionReceipt.instance.updateBloomFilter(eventData);
  }

  private updateBloomFilter(eventData: EventData) {
    // Add the event data to the bloom filter
    this.bloomFilter.add(eventData.name);
    for (const param of eventData.parameters) {
      this.bloomFilter.add(param.toString());
    }
  }

  getEvents(): EventData[] {
    return this.events;
  }

  getBloomFilter(): BloomFilter {
    return this.bloomFilter;
  }

  static get instance(): TransactionReceipt {
    // Ensure there is only one instance of TransactionReceipt
    if (!TransactionReceipt._instance) {
      TransactionReceipt._instance = new TransactionReceipt();
    }
    return TransactionReceipt._instance;
  }

  private static _instance: TransactionReceipt;
}

export { TransactionReceipt, EventData };