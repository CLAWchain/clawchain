export class VirtualMachine {
  private stack: number[] = [];
  private memory: Uint8Array = new Uint8Array(1024 * 1024); // 1MB memory
  private ip: number = 0; // instruction pointer

  execute(bytecode: Uint8Array) {
    while (this.ip < bytecode.length) {
      const opcode = bytecode[this.ip];
      switch (opcode) {
        case 0x01: // PUSH
          this.push(this.readUint32(bytecode, this.ip + 1));
          this.ip += 5;
          break;
        case 0x02: // POP
          this.pop();
          this.ip++;
          break;
        case 0x03: // ADD
          this.push(this.pop() + this.pop());
          this.ip++;
          break;
        case 0x04: // SUB
          const b = this.pop();
          const a = this.pop();
          this.push(a - b);
          this.ip++;
          break;
        // Implement other instructions like MUL, DIV, JUMP, etc.
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }

  private readUint32(bytecode: Uint8Array, offset: number): number {
    return (
      (bytecode[offset] << 24) |
      (bytecode[offset + 1] << 16) |
      (bytecode[offset + 2] << 8) |
      bytecode[offset + 3]
    );
  }

  push(value: number) {
    this.stack.push(value);
  }

  pop(): number {
    return this.stack.pop()!;
  }
}