import { Instruction, VmState } from './types';

export class VirtualMachine {
  private state: VmState = {
    stack: [],
    pc: 0,
  };

  execute(instructions: Instruction[]) {
    while (this.state.pc < instructions.length) {
      const instruction = instructions[this.state.pc];
      this.executeInstruction(instruction);
      this.state.pc++;
    }
  }

  private executeInstruction(instruction: Instruction) {
    switch (instruction.opcode) {
      case 'PUSH':
        this.state.stack.push(instruction.operand);
        break;
      case 'POP':
        this.state.stack.pop();
        break;
      case 'ADD':
        const a = this.state.stack.pop();
        const b = this.state.stack.pop();
        this.state.stack.push(a + b);
        break;
      case 'MUL':
        const c = this.state.stack.pop();
        const d = this.state.stack.pop();
        this.state.stack.push(c * d);
        break;
      // Add more instruction implementations here
    }
  }
}