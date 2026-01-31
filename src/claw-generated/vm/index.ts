import { Instruction, ExecutionContext } from './types';

class VirtualMachine {
  private stack: number[] = [];
  private pc: number = 0;
  private memory: number[] = [];
  private callStack: ExecutionContext[] = [];

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
        this.stack.push(instruction.operand!);
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
      case 'MULT':
        const c = this.stack.pop();
        const d = this.stack.pop();
        this.stack.push(c * d);
        break;
      case 'DIV':
        const e = this.stack.pop();
        const f = this.stack.pop();
        if (e === 0) {
          throw new Error('Division by zero');
        }
        this.stack.push(Math.floor(f / e));
        break;
      case 'AND':
        const g = this.stack.pop();
        const h = this.stack.pop();
        this.stack.push(g & h);
        break;
      case 'OR':
        const i = this.stack.pop();
        const j = this.stack.pop();
        this.stack.push(i | j);
        break;
      case 'XOR':
        const k = this.stack.pop();
        const l = this.stack.pop();
        this.stack.push(k ^ l);
        break;
      case 'EQ':
        const m = this.stack.pop();
        const n = this.stack.pop();
        this.stack.push(m === n ? 1 : 0);
        break;
      case 'LT':
        const o = this.stack.pop();
        const p = this.stack.pop();
        this.stack.push(p < o ? 1 : 0);
        break;
      case 'GT':
        const q = this.stack.pop();
        const r = this.stack.pop();
        this.stack.push(r > q ? 1 : 0);
        break;
      case 'JUMP':
        this.pc = instruction.operand!;
        break;
      case 'JUMPI':
        const condition = this.stack.pop();
        if (condition !== 0) {
          this.pc = instruction.operand!;
        }
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
      case 'CALL':
        this.callStack.push({ pc: this.pc, stack: [...this.stack] });
        this.pc = instruction.operand!;
        break;
      case 'RETURN':
        const { pc, stack } = this.callStack.pop()!;
        this.pc = pc;
        this.stack = stack;
        break;
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }
}

export { VirtualMachine, ExecutionContext, Instruction };