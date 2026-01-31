export enum Opcode {
  PUSH,
  POP,
  ADD,
  SUB,
  MUL,
  DIV,
  JUMP,
  JUMPI,
  LOAD,
  STORE
}

export class VirtualMachine {
  private stack: Stack;
  private memory: Memory;

  constructor() {
    this.stack = new Stack();
    this.memory = new Memory();
  }

  execute(bytecode: Uint8Array): void {
    let pc = 0; // program counter
    while (pc < bytecode.length) {
      const opcode = bytecode[pc++];
      switch (opcode) {
        case Opcode.PUSH:
          this.stack.push(bytecode[pc++]);
          break;
        case Opcode.POP:
          this.stack.pop();
          break;
        case Opcode.ADD:
          this.stack.push(this.stack.pop() + this.stack.pop());
          break;
        // Implement other instructions here
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }
}