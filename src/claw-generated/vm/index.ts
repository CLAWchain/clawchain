import { Contract } from '../contract';

export class VirtualMachine {
  private callStack: Contract[] = [];
  private gasUsed: number = 0;

  async executeCall(caller: Contract, targetAddress: string, data: Uint8Array, gas: number): Promise<Uint8Array> {
    // Look up the target contract
    const targetContract = this.getContract(targetAddress);

    // Push the caller contract to the call stack
    this.callStack.push(caller);

    // Execute the call, forwarding the provided gas
    const result = await targetContract.execute(data, gas);

    // Calculate the gas used by the call
    const gasUsedByCall = gas - targetContract.getGasLeft();
    this.gasUsed += gasUsedByCall;

    // Pop the caller contract from the call stack
    this.callStack.pop();

    return result;
  }

  getGasUsed(): number {
    return this.gasUsed;
  }

  private getContract(address: string): Contract {
    // Look up the contract by address and return it
    // (implementation omitted for brevity)
  }
}