import { Opcode } from './opcodes';

class VirtualMachine {
  private stack: number[] = [];
  private ip: number = 0;
  private memory: Uint8Array = new Uint8Array(1024);

  execute(bytecode: Uint8Array) {
    while (this.ip < bytecode.length) {
      const opcode = bytecode[this.ip];
      switch (opcode) {
        case Opcode.PUSH:
          this.stack.push(bytecode[++this.ip]);
          this.ip++;
          break;
        case Opcode.POP:
          this.stack.pop();
          this.ip++;
          break;
        case Opcode.ADD:
          const b = this.stack.pop();
          const a = this.stack.pop();
          this.stack.push(a + b);
          this.ip++;
          break;
        case Opcode.SUB:
          const y = this.stack.pop();
          const x = this.stack.pop();
          this.stack.push(x - y);
          this.ip++;
          break;
        case Opcode.JUMP:
          this.ip = bytecode[++this.ip];
          break;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }
}

export { VirtualMachine };