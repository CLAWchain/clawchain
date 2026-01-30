export class VirtualMachine {
  private stack: number[] = [];
  private bytecodeIndex = 0;
  private bytecode: Uint8Array = new Uint8Array();

  execute(bytecode: Uint8Array) {
    this.bytecode = bytecode;
    this.bytecodeIndex = 0;
    this.stack = [];
    
    while (this.bytecodeIndex < bytecode.length) {
      this.executeOpcode(bytecode[this.bytecodeIndex]);
      this.bytecodeIndex++;
    }
    
    return this.stack;
  }

  private executeOpcode(opcode: number) {
    switch (opcode) {
      case 0x01: // PUSH
        this.bytecodeIndex++;
        this.stack.push(this.bytecode[this.bytecodeIndex] || 0);
        break;
      case 0x02: // POP
        this.stack.pop();
        break;
      case 0x03: // ADD
        const a = this.stack.pop() || 0;
        const b = this.stack.pop() || 0;
        this.stack.push(a + b);
        break;
      case 0x04: // MUL
        const x = this.stack.pop() || 0;
        const y = this.stack.pop() || 0;
        this.stack.push(x * y);
        break;
      case 0x05: // JMP
        this.bytecodeIndex++;
        this.bytecodeIndex = (this.bytecode[this.bytecodeIndex] || 0) - 1;
        break;
      case 0x06: // JMPZ
        const condition = this.stack.pop() || 0;
        this.bytecodeIndex++;
        if (condition === 0) {
          this.bytecodeIndex = (this.bytecode[this.bytecodeIndex] || 0) - 1;
        }
        break;
      case 0x00: // NOP
        break;
      default:
        // Unknown opcode - ignore
        break;
    }
  }

  getStack(): number[] {
    return [...this.stack];
  }
}
