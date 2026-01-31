import { State } from './state';
import { Transaction } from './transaction';
import { Block } from './block';
import { Contract } from './contract';

export class Blockchain {
  private state: State;
  private pendingTransactions: Transaction[];
  private blocks: Block[];
  private contracts: Contract[];

  constructor() {
    this.state = new State();
    this.pendingTransactions = [];
    this.blocks = [];
    this.contracts = [];
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
    const block = new Block(this.pendingTransactions, this.state.getStateRoot());
    this.state.commitState();
    this.blocks.push(block);
    this.pendingTransactions = [];
    return block;
  }

  getLatestBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }
}