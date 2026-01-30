import { Chain } from './Chain';
import { TransactionPool } from './TransactionPool';
import { ValidatorManager } from '../validators/ValidatorManager';
import { EventBus } from '../events/EventBus';
export declare class BlockProducer {
    private chain;
    private txPool;
    private validatorManager;
    private eventBus;
    private isProducing;
    private productionInterval;
    private consecutiveFailures;
    private maxConsecutiveFailures;
    constructor(chain: Chain, txPool: TransactionPool, validatorManager: ValidatorManager, eventBus: EventBus);
    start(): void;
    stop(): void;
    private produceBlock;
    getStats(): {
        isProducing: boolean;
        consecutiveFailures: number;
        currentDifficulty: number;
    };
}
//# sourceMappingURL=BlockProducer.d.ts.map