import { Instruction, VMState } from './types';

export class VirtualMachine {
  private stack: any[] = [];
  private pc: number = 0;
  private memory: Uint8Array = new Uint8Array();

  execute(instructions: Instruction[]) {
    while (this.pc < instructions.length) {
      const instruction = instructions[this.pc];
      this.executeInstruction(instruction);
      this.pc++;
    }
  }

  private executeInstruction(instruction: Instruction) {
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