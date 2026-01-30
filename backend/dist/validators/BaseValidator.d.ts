import { Block } from '../blockchain/Block';
export declare abstract class BaseValidator {
    abstract address: string;
    abstract name: string;
    abstract symbol: string;
    abstract model: string;
    abstract provider: string;
    abstract role: string;
    abstract personality: string;
    abstract philosophy: string;
    initialize(): Promise<void>;
    validateBlock(block: Block): Promise<boolean>;
    protected aiValidation(block: Block): Promise<boolean>;
    abstract chat(message: string, context?: any): Promise<string>;
}
//# sourceMappingURL=BaseValidator.d.ts.map