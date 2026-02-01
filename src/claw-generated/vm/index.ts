import { Opcode } from './opcodes';

class VirtualMachine {
  private stack: number[] = [];
  private pc: number = 0;
  private memory: number[] = [];

  execute(bytecode: Opcode[]) {
    while (this.pc < bytecode.length) {
      const op = bytecode[this.pc];
      this.executeOpcode(op);
      this.pc++;
    }
  }

  private executeOpcode(op: Opcode) {
    switch (op.name) {
      case 'PUSH':
        this.stack.push(op.operand);
        break;
      case 'POP':
        this.stack.pop();
        break;
      case 'ADD':
        this.stack.push(this.stack.pop() + this.stack.pop());
        break;
      case 'MUL':
        this.stack.push(this.stack.pop() * this.stack.pop());
        break;
      // Add more opcodes as needed
    }
  }
}

export { VirtualMachine };