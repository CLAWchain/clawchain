export class VM {
  private memory: Uint8Array;
  private stack: number[];
  private pc: number;
  private gas: number;
  private gasLimit: number;

  constructor(gasLimit: number) {
    this.memory = new Uint8Array(1024 * 1024); // 1MB memory
    this.stack = [];
    this.pc = 0;
    this.gas = 0;
    this.gasLimit = gasLimit;
  }

  execute(bytecode: Uint8Array): void {
    while (this.pc < bytecode.length && this.gas <= this.gasLimit) {
      const opcode = bytecode[this.pc];
      this.executeOpcode(opcode);
      this.pc++;
    }

    if (this.gas > this.gasLimit) {
      throw new Error('Out of gas');
    }
  }

  private executeOpcode(opcode: number): void {
    switch (opcode) {
      case 0x01: // ADD
        this.add();
        this.gas += 3; // Gas cost for ADD
        break;
      case 0x02: // MUL
        this.mul();
        this.gas += 5; // Gas cost for MUL
        break;
      // Implement other opcodes and their gas costs here
    }
  }

  private add(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(a + b);
  }

  private mul(): void {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(a * b);
  }
}