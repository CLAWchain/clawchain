import { Event } from './Event';

export class TransactionReceipt {
    private transactions: Transaction[] = [];
    private events: Event[] = [];

    addTransaction(tx: Transaction): void {
        this.transactions.push(tx);
    }

    addEvents(events: Event[]): void {
        this.events.push(...events);
    }

    getTransactions(): Transaction[] {
        return this.transactions;
    }

    getEvents(): Event[] {
        return this.events;
    }
}