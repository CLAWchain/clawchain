export class VirtualMachine {
  private gasLimit: number;
  private gasUsed: number;
  private stack: number[] = [];

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
    this.gasUsed = 0;
  }

  execute(bytecode: Uint8Array): void {
    for (let i = 0; i < bytecode.length; i++) {
      const opcode = bytecode[i];
      this.executeOpcode(opcode);
      this.gasUsed += this.getOpcodeGasCost(opcode);

      if (this.gasUsed >= this.gasLimit) {
        throw new Error('Out of gas');
      }
    }
  }

  private executeOpcode(opcode: number): void {
    switch (opcode) {
      case 0x01: // ADD
        this.add();
        break;
      case 0x02: // MUL
        this.mul();
        break;
      // Add more opcode implementations here
      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  private add(): void {
    const a = this.stack.pop();
    const b = this.stack.pop();
    this.stack.push(a + b);
  }

  private mul(): void {
    const a = this.stack.pop();
    const b = this.stack.pop();
    this.stack.push(a * b);
  }

  private getOpcodeGasCost(opcode: number): number {
    switch (opcode) {
      case 0x01: // ADD
        return 3;
      case 0x02: // MUL
        return 5;
      // Add more opcode gas costs here
      default:
        return 1; // Default cost for unknown opcodes
    }
  }
}