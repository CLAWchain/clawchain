export class VirtualMachine {
  private stack: any[] = [];
  private gas: number;

  constructor(initialGas: number) {
    this.gas = initialGas;
  }

  execute(bytecode: Uint8Array) {
    let pc = 0; // program counter
    while (pc < bytecode.length) {
      const opcode = bytecode[pc];
      switch (opcode) {
        case 0x01: // PUSH
          pc++;
          const value = bytecode[pc];
          this.pushToStack(value);
          this.deductGas(1); // Gas cost for PUSH
          pc++;
          break;
        case 0x02: // POP
          this.popFromStack();
          this.deductGas(1); // Gas cost for POP
          break;
        case 0x03: // ADD
          const b = this.popFromStack();
          const a = this.popFromStack();
          this.pushToStack(a + b);
          this.deductGas(3); // Gas cost for ADD
          break;
        // Add more opcodes here with appropriate gas costs
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }

      if (this.gas <= 0) {
        throw new Error('Out of gas');
      }

      pc++;
    }
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
}