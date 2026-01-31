// src/claw-generated/vm.ts
import { Contract, ContractState, Transaction } from './contract';

export class VirtualMachine {
  private gasLimit: number;
  private gasUsed: number;
  private callStack: Contract[] = [];

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
    this.gasUsed = 0;
  }

  async execute(contract: Contract, tx: Transaction): Promise<ContractState> {
    this.callStack.push(contract);
    const result = await this.executeInternal(contract, tx);
    this.callStack.pop();
    return result;
  }

  private async executeInternal(contract: Contract, tx: Transaction): Promise<ContractState> {
    const initialState = contract.state.clone();

    // Execute the transaction
    await contract.execute(tx, this);

    // Update gas usage
    this.consumeGas(this.gasUsed);

    // Revert state if transaction failed
    if (!this.checkGasLimit()) {
      contract.state = initialState;
      throw new Error('Out of gas');
    }

    return contract.state;
  }

  async call(targetContract: Contract, callData: any, value: number): Promise<any> {
    // Push the target contract onto the call stack
    this.callStack.push(targetContract);

    // Create a new transaction for the call
    const tx = {
      to: targetContract.address,
      data: callData,
      value: value,
    };

    // Execute the call
    const result = await this.executeInternal(targetContract, tx);

    // Pop the target contract from the call stack
    this.callStack.pop();

    return result;
  }

  private checkGasLimit(): boolean {
    return this.gasUsed <= this.gasLimit;
  }

  private consumeGas(amount: number): void {
    this.gasUsed += amount;
    if (!this.checkGasLimit()) {
      throw new Error('Out of gas');
    }
  }
}