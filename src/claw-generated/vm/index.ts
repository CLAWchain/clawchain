import { Instruction, VMState } from './types';

const GAS_COSTS: Record<string, number> = {
  PUSH: 3,
  POP: 2,
  ADD: 5,
  SUB: 5,
  MUL: 10,
  DIV: 10,
  LOAD: 3,
  STORE: 20,
};

export class VirtualMachine {
  private stack: any[] = [];
  private pc: number = 0;
  private memory: Uint8Array = new Uint8Array();
  private gasLimit: number;
  private gasUsed: number = 0;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
  }

  execute(instructions: Instruction[]) {
    try {
      while (this.pc < instructions.length) {
        const instruction = instructions[this.pc];
        this.executeInstruction(instruction);
        this.pc++;
      }
    } catch (err) {
      if (err.message === 'Out of gas') {
        console.error('Execution halted due to out of gas');
      } else {
        throw err;
      }
    }
  }

  private executeInstruction(instruction: Instruction) {
    const gasCost = GAS_COSTS[instruction.opcode] || 0;
    if (this.gasUsed + gasCost > this.gasLimit) {
      throw new Error('Out of gas');
    }

    this.gasUsed += gasCost;

    switch (instruction.opcode) {
      case 'PUSH':
        this.stack.push(instruction.operand);
        break;
      case 'POP':
        this.stack.pop();
        break;
      case 'ADD':
        const a = this.stack.pop();
        const b = this.stack.pop();
        this.stack.push(a + b);
        break;
      case 'SUB':
        const x = this.stack.pop();
        const y = this.stack.pop();
        this.stack.push(y - x);
        break;
      case 'MUL':
        const m1 = this.stack.pop();
        const m2 = this.stack.pop();
        this.stack.push(m1 * m2);
        break;
      case 'DIV':
        const d1 = this.stack.pop();
        const d2 = this.stack.pop();
        this.stack.push(d2 / d1);
        break;
      case 'LOAD':
        const address = this.stack.pop();
        this.stack.push(this.memory[address]);
        break;
      case 'STORE':
        const value = this.stack.pop();
        const storeAddress = this.stack.pop();
        this.memory[storeAddress] = value;
        break;
      // Add more instruction implementations here
    }
  }
}