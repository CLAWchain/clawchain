export type Instruction = {
  opcode: string;
  operand?: number;
  gas: number;
};

const GAS_COSTS: { [key: string]: number } = {
  PUSH: 3,
  POP: 2,
  ADD: 5,
  SUB: 5,
  MUL: 10,
  DIV: 10,
};

export class VirtualMachine {
  private stack: number[] = [];
  private gas: number;
  private gasLimit: number;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
    this.gas = gasLimit;
  }

  execute(bytecode: Instruction[]) {
    for (const instruction of bytecode) {
      if (this.gas < instruction.gas) {
        throw new Error('Ran out of gas');
      }
      this.executeInstruction(instruction);
      this.gas -= instruction.gas;
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