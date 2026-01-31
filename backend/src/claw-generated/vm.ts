import { Opcode, ExecutionContext } from './opcodes';

export class VM {
  private ctx: ExecutionContext;

  constructor() {
    this.ctx = {
      stack: [],
      memory: new Uint8Array(1024 * 1024), // 1MB memory
      pc: 0
    };
  }

  execute(bytecode: Uint8Array): void {
    while (this.ctx.pc < bytecode.length) {
      const opcode = bytecode[this.ctx.pc++];
      switch (opcode) {
        case Opcode.PUSH:
          this.ctx.stack.push(bytecode[this.ctx.pc++]);
          break;
        case Opcode.POP:
          this.ctx.stack.pop();
          break;
        case Opcode.ADD:
          this.ctx.stack.push(this.ctx.stack.pop() + this.ctx.stack.pop());
          break;
        case Opcode.SUB:
          const b = this.ctx.stack.pop();
          const a = this.ctx.stack.pop();
          this.ctx.stack.push(a - b);
          break;
        case Opcode.MUL:
          this.ctx.stack.push(this.ctx.stack.pop() * this.ctx.stack.pop());
          break;
        case Opcode.DIV:
          const divisor = this.ctx.stack.pop();
          const dividend = this.ctx.stack.pop();
          this.ctx.stack.push(Math.floor(dividend / divisor));
          break;
        case Opcode.JUMP:
          this.ctx.pc = this.ctx.stack.pop();
          break;
        case Opcode.JUMPI:
          const condition = this.ctx.stack.pop();
          if (condition !== 0) {
            this.ctx.pc = this.ctx.stack.pop();
          } else {
            this.ctx.pc++;
          }
          break;
        case Opcode.STOP:
          return;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }
}