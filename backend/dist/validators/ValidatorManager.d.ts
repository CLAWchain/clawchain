import { Block } from '../blockchain/Block';
import { BaseValidator } from './BaseValidator';
export declare class ValidatorManager {
    private validators;
    private currentProducerIndex;
    private validatorOrder;
    initialize(): Promise<void>;
    selectProducer(): Promise<BaseValidator | null>;
    getConsensus(block: Block): Promise<boolean>;
    recordBlockProduced(address: string): Promise<void>;
    getValidator(address: string): BaseValidator | undefined;
    getAllValidators(): BaseValidator[];
}
//# sourceMappingURL=ValidatorManager.d.ts.map