import { EventEmitter } from 'events';
export declare class EventBus extends EventEmitter {
    private static instance;
    private constructor();
    static getInstance(): EventBus;
    emitBlockProduced(data: any): void;
    emitTransactionAdded(data: any): void;
    emitDebateMessage(data: any): void;
    emitVoteCast(data: any): void;
    emitConsensusEvent(data: any): void;
}
export declare const eventBus: EventBus;
//# sourceMappingURL=EventBus.d.ts.map