import { Opcode, ContractBytecode } from './types';

export class VirtualMachine {
  private stack: any[] = [];
  private pc: number = 0;
  private gas: number = 0;
  private gasLimit: number;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
  }

  execute(bytecode: ContractBytecode): any {
    while (this.pc < bytecode.length) {
      const { opcode, args } = bytecode[this.pc];
      this.executeOpcode(opcode, args);
      this.pc++;
    }
    return this.stack.pop();
  }

  private executeOpcode(opcode: Opcode, args?: any[]) {
    this.consumeGas(opcode.gas);
    switch (opcode.id) {
      case Opcode.PUSH.id:
        this.stack.push(args?.[0]);
        break;
      case Opcode.POP.id:
        if (this.stack.length === 0) {
          throw new Error('Stack underflow');
        }
        this.stack.pop();
        break;
      case Opcode.ADD.id:
        if (this.stack.length < 2) {
          throw new Error('Stack underflow');
        }
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a + b);
        break;
      case Opcode.SUB.id:
        if (this.stack.length < 2) {
          throw new Error('Stack underflow');
        }
        const d = this.stack.pop();
        const c = this.stack.pop();
        this.stack.push(c - d);
        break;
      // Add implementations for other opcodes
      default:
        throw new Error(`Invalid opcode: ${opcode.id}`);
    }
  }

  private consumeGas(amount: number) {
    this.gas += amount;
    if (this.gas > this.gasLimit) {
      throw new Error('Out of gas');
    }
  }
}