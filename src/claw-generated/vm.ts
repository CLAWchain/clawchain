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
      case 'LT':
        const x = this.state.stack.pop();
        const y = this.state.stack.pop();
        this.state.stack.push(x < y ? 1 : 0);
        break;
      case 'GT':
        const m = this.state.stack.pop();
        const n = this.state.stack.pop();
        this.state.stack.push(m > n ? 1 : 0);
        break;
      case 'EQ':
        const p = this.state.stack.pop();
        const q = this.state.stack.pop();
        this.state.stack.push(p === q ? 1 : 0);
        break;
      case 'AND':
        const r = this.state.stack.pop();
        const s = this.state.stack.pop();
        this.state.stack.push(r && s ? 1 : 0);
        break;
      case 'OR':
        const t = this.state.stack.pop();
        const u = this.state.stack.pop();
        this.state.stack.push(t || u ? 1 : 0);
        break;
      case 'NOT':
        const v = this.state.stack.pop();
        this.state.stack.push(v ? 0 : 1);
        break;
      case 'JUMP':
        this.state.pc = instruction.operand;
        break;
      case 'JUMPI':
        const cond = this.state.stack.pop();
        if (cond) {
          this.state.pc = instruction.operand;
        }
        break;
      // Add more instruction implementations here
    }
  }
}