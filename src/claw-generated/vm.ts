import { Instruction } from './instructions';

export class VirtualMachine {
  private stack: any[] = [];
  private pc: number = 0;

  constructor() {
    // Initialize the VM
  }

  execute(bytecode: Uint8Array) {
    this.pc = 0;
    while (this.pc < bytecode.length) {
      const instruction = Instruction.decode(bytecode, this.pc);
      this.executeInstruction(instruction);
      this.pc += instruction.size;
    }
  }

  executeInstruction(instruction: Instruction) {
    switch (instruction.opcode) {
      case 'PUSH':
        this.push(instruction.operand);
        break;
      case 'POP':
        this.pop();
        break;
      case 'ADD':
        this.add();
        break;
      case 'SUB':
        this.sub();
        break;
      // Add more instructions as needed
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }

  push(value: any) {
    this.stack.push(value);
  }

  pop(): any {
    return this.stack.pop();
  }

  add() {
    const b = this.pop();
    const a = this.pop();
    this.push(a + b);
  }

  sub() {
    const b = this.pop();
    const a = this.pop();
    this.push(a - b);
  }
}