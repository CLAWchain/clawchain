import { EventEmitter } from './EventEmitter.sol';
import { TransactionReceipt } from './TransactionReceipt';
import { BloomFilter } from './BloomFilter';

class TransactionProcessor {
    private eventEmitter: EventEmitter;
    private transactionReceipt: TransactionReceipt;
    private bloomFilter: BloomFilter;

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.transactionReceipt = new TransactionReceipt();
        this.bloomFilter = new BloomFilter();
    }

    async processTransaction(tx: Transaction): Promise<void> {
        // Validate and execute the transaction
        await this.executeTransaction(tx);

        // Capture and store any events emitted during execution
        this.captureEvents(tx);

        // Update the transaction receipt and bloom filter
        this.updateTransactionReceipt(tx);
        this.updateBloomFilter(tx);
    }

    private async executeTransaction(tx: Transaction): Promise<void> {
        // Execute the transaction and update the state
        await this.executeContractCall(tx);
    }

    private captureEvents(tx: Transaction): void {
        // Iterate through the emitted events and store them
        for (const event of tx.events) {
            this.eventEmitter.emit(event.message);
        }
    }

    private updateTransactionReceipt(tx: Transaction): void {
        // Add the transaction details and emitted events to the receipt
        this.transactionReceipt.addTransaction(tx);
        this.transactionReceipt.addEvents(tx.events);
    }

    private updateBloomFilter(tx: Transaction): void {
        // Update the bloom filter with the emitted event data
        for (const event of tx.events) {
            this.bloomFilter.add(event.message);
        }
    }
}