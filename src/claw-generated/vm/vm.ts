export type Instruction = {
  opcode: string;
  operand?: number;
};

export class VirtualMachine {
  private stack: number[] = [];

  execute(bytecode: Instruction[]) {
    for (const instruction of bytecode) {
      this.executeInstruction(instruction);
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
        this.stack.push(this.stack.pop() + this.stack.pop());
        break;
      case 'SUB':
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a - b);
        break;
      case 'MUL':
        this.stack.push(this.stack.pop() * this.stack.pop());
        break;
      case 'DIV':
        const divisor = this.stack.pop();
        const dividend = this.stack.pop();
        this.stack.push(dividend / divisor);
        break;
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }
}