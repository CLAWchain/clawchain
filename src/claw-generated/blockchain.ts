import { State } from './state';
import { Transaction } from './transaction';
import { Block } from './block';
import { Contract } from './contract';

const INITIAL_MAX_BLOCK_SIZE = 1000000; // 1 MB
const BLOCK_SIZE_ADJUSTMENT_INTERVAL = 10; // Adjust every 10 blocks

export class Blockchain {
  private state: State;
  private pendingTransactions: Transaction[];
  private blocks: Block[];
  private contracts: Contract[];
  private maxBlockSize: number;

  constructor() {
    this.state = new State();
    this.pendingTransactions = [];
    this.blocks = [];
    this.contracts = [];
    this.maxBlockSize = INITIAL_MAX_BLOCK_SIZE;
  }

  addTransaction(tx: Transaction): void {
    // Check if the transaction is a contract deployment
    if (tx.contractBytecode) {
      this.deployContract(tx);
    } else {
      this.pendingTransactions.push(tx);
    }
  }

  deployContract(tx: Transaction): void {
    // Generate the contract address deterministically
    const contractAddress = this.generateContractAddress(tx);

    // Create a new contract instance
    const contract = new Contract(contractAddress, tx.contractBytecode);

    // Execute the contract creation and update the state
    this.executeContract(contract);

    // Add the contract to the contracts list
    this.contracts.push(contract);
  }

  private generateContractAddress(tx: Transaction): string {
    // Implement deterministic contract address generation logic here
    // e.g., based on the sender's address, nonce, and transaction hash
    return `0x${tx.from.address.slice(2)}-${tx.nonce}`;
  }

  private executeContract(contract: Contract): void {
    // Implement contract execution logic here
    // Use the VirtualMachine to execute the contract bytecode
  }

  mineBlock(): Block {
    // Check if the block size exceeds the limit
    if (this.pendingTransactions.length > this.maxBlockSize) {
      throw new Error('Block size exceeds the limit');
    }

    const block = new Block(this.pendingTransactions, this.state.getStateRoot());
    this.state.commitState();
    this.blocks.push(block);

    // Adjust the block size limit after every BLOCK_SIZE_ADJUSTMENT_INTERVAL blocks
    if (this.blocks.length % BLOCK_SIZE_ADJUSTMENT_INTERVAL === 0) {
      this.adjustBlockSizeLimit();
    }

    this.pendingTransactions = [];
    return block;
  }

  private adjustBlockSizeLimit(): void {
    // Implement dynamic block size adjustment logic here
    // e.g., based on network congestion, transaction volume, and block propagation times
    this.maxBlockSize = Math.max(INITIAL_MAX_BLOCK_SIZE, this.maxBlockSize * 1.1);
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }
}