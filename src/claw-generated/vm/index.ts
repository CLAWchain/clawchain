import { Instruction, OperationHandler } from './types';

class VirtualMachine {
  private stack: any[] = [];
  private memory: Map<number, number> = new Map();

  executeInstruction(instruction: Instruction): void {
    const handler = this.getOperationHandler(instruction.opcode);
    handler(this, instruction.operands);
  }

  private getOperationHandler(opcode: number): OperationHandler {
    switch (opcode) {
      case 0x01: // ADD
        return this.add;
      case 0x02: // SUB
        return this.sub;
      case 0x03: // MUL
        return this.mul;
      case 0x04: // DIV
        return this.div;
      case 0x05: // AND
        return this.and;
      case 0x06: // OR
        return this.or;
      case 0x07: // NOT
        return this.not;
      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  private add = (_, [a, b]: [number, number]): void => {
    this.stack.push(a + b);
  };

  private sub = (_, [a, b]: [number, number]): void => {
    this.stack.push(a - b);
  };

  private mul = (_, [a, b]: [number, number]): void => {
    this.stack.push(a * b);
  };

  private div = (_, [a, b]: [number, number]): void => {
    this.stack.push(a / b);
  };

  private and = (_, [a, b]: [number, number]): void => {
    this.stack.push(a & b);
  };

  private or = (_, [a, b]: [number, number]): void => {
    this.stack.push(a | b);
  };

  private not = (_, [a]: [number]): void => {
    this.stack.push(~a);
  };
}

export { VirtualMachine };