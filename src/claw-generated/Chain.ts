import { Block } from './Block';
import { GenesisConfig } from './GenesisConfig';
import { StateManager } from './StateManager';
import { Crypto } from './Crypto';

export class Chain {
  private static instance: Chain;
  private validators: Buffer[];
  private currentBlock: Block;

  private constructor() {
    this.validators = [];
    this.currentBlock = this.getGenesisBlock();
  }

  public static getInstance(): Chain {
    if (!Chain.instance) {
      Chain.instance = new Chain();
    }
    return Chain.instance;
  }

  private getGenesisBlock(): Block {
    const genesisConfig = GenesisConfig.getInstance();
    return genesisConfig.generateGenesisBlock();
  }

  public addValidator(validatorAddress: Buffer): void {
    this.validators.push(validatorAddress);
  }

  public getCurrentBlock(): Block {
    return this.currentBlock;
  }

  public appendBlock(block: Block): void {
    // Validate the block and add it to the chain
    this.currentBlock = block;
  }
}