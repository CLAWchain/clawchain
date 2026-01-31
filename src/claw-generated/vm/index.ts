// src/claw-generated/vm/index.ts
export class VM {
  private stack: number[] = [];

  push(value: number) {
    this.stack.push(value);
  }

  pop(): number {
    return this.stack.pop()!;
  }

  add(): number {
    const b = this.pop();
    const a = this.pop();
    return a + b;
  }

  sub(): number {
    const b = this.pop();
    const a = this.pop();
    return a - b;
  }

  execute(bytecode: number[]) {
    for (const opcode of bytecode) {
      switch (opcode) {
        case 0x01: // PUSH
          this.push(bytecode[++this.ip]);
          break;
        case 0x02: // ADD
          this.push(this.add());
          break;
        case 0x03: // SUB
          this.push(this.sub());
          break;
        case 0x04: // JUMP
          this.ip = bytecode[++this.ip];
          break;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }
}