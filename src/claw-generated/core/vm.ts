import { Instruction, Operation } from './types';

class VirtualMachine {
  private stack: any[] = [];
  private programCounter: number = 0;
  private bytecode: Instruction[] = [];

  loadContract(bytecode: Instruction[]): void {
    this.bytecode = bytecode;
    this.programCounter = 0;
  }

  execute(): void {
    while (this.programCounter < this.bytecode.length) {
      const instruction = this.bytecode[this.programCounter];
      this.performOperation(instruction.opcode, instruction.operand);
      this.programCounter++;
    }
  }

  pushToStack(value: any): void {
    this.stack.push(value);
  }

  popFromStack(): any {
    return this.stack.pop();
  }

  performOperation(opcode: number, operand?: number): void {
    switch (opcode) {
      case Operation.PUSH:
        this.pushToStack(operand);
        break;
      case Operation.POP:
        this.popFromStack();
        break;
      case Operation.ADD:
        this.pushToStack(this.popFromStack() + this.popFromStack());
        break;
      case Operation.SUB:
        const b = this.popFromStack();
        const a = this.popFromStack();
        this.pushToStack(a - b);
        break;
      case Operation.MUL:
        this.pushToStack(this.popFromStack() * this.popFromStack());
        break;
      case Operation.DIV:
        const divisor = this.popFromStack();
        const dividend = this.popFromStack();
        this.pushToStack(dividend / divisor);
        break;
      case Operation.JUMP:
        this.programCounter = operand;
        break;
      case Operation.JUMPI:
        const condition = this.popFromStack();
        if (condition) {
          this.programCounter = operand;
        }
        break;
      case Operation.LOAD:
        // Load value from memory
        break;
      case Operation.STORE:
        // Store value to memory
        break;
      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }
}

export default VirtualMachine;