import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
  private static instance: EventBus;

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
  }

  emitTransactionAdded(data: any) {
    this.emit('transaction_added', data);
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
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
