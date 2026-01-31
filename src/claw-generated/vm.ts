import { Opcode, ExecutionResult } from './types';

class VirtualMachine {
  private stack: number[] = [];
  private pc: number = 0;
  private memory: number[] = [];

  execute(bytecode: Opcode[]): ExecutionResult {
    while (this.pc < bytecode.length) {
      const opcode = bytecode[this.pc];
      this.executeOpcode(opcode);
      this.pc++;
    }

    return {
      stack: this.stack,
      memory: this.memory
    };
  }

  private executeOpcode(opcode: Opcode) {
    switch (opcode.name) {
      case 'PUSH':
        this.stack.push(opcode.operand);
        break;
      case 'POP':
        this.stack.pop();
        break;
      case 'ADD':
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a + b);
        break;
      case 'JUMP':
        this.pc = opcode.operand;
        break;
      default:
        throw new Error(`Unknown opcode: ${opcode.name}`);
    }
  }
}

export { VirtualMachine };