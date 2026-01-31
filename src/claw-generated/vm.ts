export class VirtualMachine {
  private stack: number[] = [];

  execute(bytecode: Uint8Array) {
    for (let i = 0; i < bytecode.length; i++) {
      const opcode = bytecode[i];
      switch (opcode) {
        case 0x01: // PUSH
          this.stack.push(bytecode[++i]);
          break;
        case 0x02: // ADD
          this.stack.push(this.stack.pop() + this.stack.pop());
          break;
        case 0x03: // MUL
          this.stack.push(this.stack.pop() * this.stack.pop());
          break;
        case 0x04: // JUMP
          i = bytecode[++i] - 1;
          break;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }
}