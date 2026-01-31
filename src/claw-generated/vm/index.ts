import { Instruction } from './instructions';

export class VM {
  private stack: any[] = [];
  private memory: Map<number, number> = new Map();

  execute(instructions: Instruction[]) {
    for (const instruction of instructions) {
      this.executeInstruction(instruction);
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
        this.binaryOp((a, b) => a + b);
        break;
      case 'SUB':
        this.binaryOp((a, b) => a - b);
        break;
      case 'MUL':
        this.binaryOp((a, b) => a * b);
        break;
      case 'DIV':
        this.binaryOp((a, b) => a / b);
        break;
      case 'JUMP':
        // TODO: implement jump logic
        break;
      case 'JUMPI':
        // TODO: implement conditional jump logic
        break;
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }

  private binaryOp(op: (a: number, b: number) => number) {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(op(a, b));
  }
}

export interface Instruction {
  opcode: string;
  operand?: number;
}