import { EventEmitter } from 'events';
import { BloomFilter } from './bloom-filter';

export class EventBus extends EventEmitter {
  private static instance: EventBus;
  private blockBloomFilters: Map<number, BloomFilter> = new Map();

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  emitBlockProduced(data: any) {
    this.emit('block_produced', data);
    this.updateBlockBloomFilter(data.blockNumber, data.events);
  }

  emitTransactionAdded(data: any) {
    this.emit('transaction_added', data);
    this.updateBlockBloomFilter(data.blockNumber, data.events);
  }

  emitDebateMessage(data: any) {
    this.emit('debate_message', data);
  }

  emitVoteCast(data: any) {
    this.emit('vote_cast', data);
  }

  emitConsensusEvent(data: any) {
    this.emit('consensus_event', data);
  }

  emitEventQuery(data: { blockNumbers: number[], eventFilter: any }) {
    this.emit('event_query', data);
  }

  updateBlockBloomFilter(blockNumber: number, events: any[]) {
    let bloomFilter = this.blockBloomFilters.get(blockNumber);
    if (!bloomFilter) {
      bloomFilter = new BloomFilter();
      this.blockBloomFilters.set(blockNumber, bloomFilter);
    }

    for (const event of events) {
      bloomFilter.add(event);
    }
  }

  getBlockBloomFilter(blockNumber: number): BloomFilter | undefined {
    return this.blockBloomFilters.get(blockNumber);
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();