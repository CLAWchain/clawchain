import { Opcode, ContractBytecode } from './types';

export class VirtualMachine {
  private stack: any[] = [];
  private pc: number = 0;

  execute(bytecode: ContractBytecode): any {
    while (this.pc < bytecode.length) {
      const opcode = bytecode[this.pc];
      this.executeOpcode(opcode, bytecode);
      this.pc++;
    }
    return this.stack.pop();
  }

  private executeOpcode(opcode: Opcode, bytecode: ContractBytecode) {
    switch (opcode) {
      case Opcode.PUSH:
        this.stack.push(bytecode[++this.pc]);
        break;
      case Opcode.POP:
        if (this.stack.length === 0) {
          throw new Error('Stack underflow');
        }
        this.stack.pop();
        break;
      case Opcode.ADD:
        if (this.stack.length < 2) {
          throw new Error('Stack underflow');
        }
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a + b);
        break;
      case Opcode.SUB:
        if (this.stack.length < 2) {
          throw new Error('Stack underflow');
        }
        const d = this.stack.pop();
        const c = this.stack.pop();
        this.stack.push(c - d);
        break;
      // Add implementations for other opcodes
      default:
        throw new Error(`Invalid opcode: ${opcode}`);
    }
  }
}