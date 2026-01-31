import { Opcode, OpcodeExecutor } from './opcodes';
import { Memory } from './memory';
import { Stack } from './stack';
import { utils } from './utils';

export class VirtualMachine {
  private memory: Memory;
  private stack: Stack;
  private gasLimit: number;
  private gasUsed: number;

  constructor(gasLimit: number) {
    this.memory = new Memory();
    this.stack = new Stack();
    this.gasLimit = gasLimit;
    this.gasUsed = 0;
  }

  execute(code: Uint8Array): void {
    let pc = 0;
    while (pc < code.length) {
      const opcode = code[pc];
      const executor = OpcodeExecutor[opcode];
      if (!executor) {
        throw new Error(`Unknown opcode: ${opcode}`);
      }

      const gasRequired = executor.gasCost;
      if (this.gasUsed + gasRequired > this.gasLimit) {
        throw new Error('Out of gas');
      }

      this.gasUsed += gasRequired;
      executor.execute(this.memory, this.stack);
      pc += 1;
    }
  }

  getGasUsed(): number {
    return this.gasUsed;
  }

  getGasLimit(): number {
    return this.gasLimit;
  }
}