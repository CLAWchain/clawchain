export class VirtualMachine {
  private stack: number[] = [];
  private bytecodeIndex = 0;

  execute(bytecode: Uint8Array) {
    this.bytecodeIndex = 0;
    for (const opcode of bytecode) {
      this.executeOpcode(opcode);
    }
  }

  private executeOpcode(opcode: number) {
    switch (opcode) {
      case 0x01: // PUSH
        this.stack.push(this.readNextByte());
        break;
      case 0x02: // POP
        this.stack.pop();
        break;
      case 0x03: // ADD
        this.stack.push(this.stack.pop() + this.stack.pop());
        break;
      case 0x04: // MUL
        this.stack.push(this.stack.pop() * this.stack.pop());
        break;
      case 0x05: // JMP
        this.bytecodeIndex = this.readNextByte();
        break;
      case 0x06: // JMPZ
        const condition = this.stack.pop();
        if (condition === 0) {
          this.bytecodeIndex = this.readNextByte();
        }
        break;
      // Add more opcodes as needed
      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  private readNextByte(): number {
    const byte = this.bytecodeIndex < this.bytecode.length ? this.bytecode[this.bytecodeIndex] : 0;
    this.bytecodeIndex++;
    return byte;
  }

  private bytecode: Uint8Array;
}