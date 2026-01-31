export class VirtualMachine {
  private stack: any[] = [];
  private gas: number;

  constructor(initialGas: number) {
    this.gas = initialGas;
  }

  execute(bytecode: Uint8Array) {
    // Existing execute logic
  }

  pushToStack(value: any) {
    this.stack.push(value);
  }

  popFromStack() {
    return this.stack.pop();
  }

  peekStack() {
    return this.stack[this.stack.length - 1];
  }

  getStackSize() {
    return this.stack.length;
  }

  private deductGas(amount: number) {
    this.gas -= amount;
  }

  // New methods for RPC server
  executeContract(address: string, input: Uint8Array): Uint8Array {
    // Implement contract execution logic
    return new Uint8Array([0x01, 0x02, 0x03]);
  }

  getBalance(address: string): bigint {
    // Implement balance retrieval logic
    return BigInt(0);
  }
}