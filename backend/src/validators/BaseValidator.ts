import { Block } from '../blockchain/Block';

export abstract class BaseValidator {
  abstract address: string;
  abstract name: string;
  abstract symbol: string;
  abstract model: string;
  abstract provider: string;
  abstract role: string;
  abstract personality: string;
  abstract philosophy: string;

  async initialize() {
    console.log(`Initializing ${this.name}...`);
  }

  async validateBlock(block: Block): Promise<boolean> {
    if (!block.isValid()) {
      return false;
    }
    
    return await this.aiValidation(block);
  }

  protected async aiValidation(block: Block): Promise<boolean> {
    return true;
  }

  abstract chat(message: string, context?: any): Promise<string>;
}

