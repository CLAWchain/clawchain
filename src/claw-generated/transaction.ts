import { Event, EventEmitter } from './event';

export class Transaction {
  nonce: number;
  from: string;
  to: string;
  value: number;
  data: Uint8Array;
  signature: Uint8Array;
  events: Event[];

  constructor(
    nonce: number,
    from: string,
    to: string,
    value: number,
    data: Uint8Array,
    signature: Uint8Array
  ) {
    this.nonce = nonce;
    this.from = from;
    this.to = to;
    this.value = value;
    this.data = data;
    this.signature = signature;
    this.events = [];
  }

  execute(state: any): any {
    // Execute the transaction and update the state
    const emitter = new EventEmitter();
    // Contract execution logic goes here
    // emitter.emit('MyEvent', { foo: 'bar' });
    this.events = emitter.getEvents();
    // Return the transaction receipt
    return {
      status: 1,
      events: this.events
    };
  }
}