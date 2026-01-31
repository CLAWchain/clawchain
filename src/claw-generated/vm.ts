export class VirtualMachine {
  private stack: any[] = [];

  execute(bytecode: Uint8Array) {
    let pc = 0; // program counter
    while (pc < bytecode.length) {
      const opcode = bytecode[pc];
      switch (opcode) {
        case 0x01: // PUSH
          pc++;
          const value = bytecode[pc];
          this.pushToStack(value);
          pc++;
          break;
        case 0x02: // POP
          this.popFromStack();
          break;
        case 0x03: // ADD
          const b = this.popFromStack();
          const a = this.popFromStack();
          this.pushToStack(a + b);
          break;
        // Add more opcodes here
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
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
}