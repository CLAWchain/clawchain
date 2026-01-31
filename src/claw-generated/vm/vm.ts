import { Opcode } from './opcode';

export class VM {
  private gasLimit: number;
  private gasUsed: number = 0;

  constructor(gasLimit: number) {
    this.gasLimit = gasLimit;
  }

  execute(code: Uint8Array): void {
    let pc = 0;
    while (pc < code.length) {
      const opcode = code[pc];
      const opcodeInfo = Opcode[opcode];
      if (!opcodeInfo) {
        throw new Error(`Unknown opcode: ${opcode}`);
      }

      this.gasUsed += opcodeInfo.gas;
      if (this.gasUsed > this.gasLimit) {
        throw new Error('Out of gas');
      }

      // Execute the opcode
      switch (opcodeInfo.id) {
        case Opcode.ADD.id:
          // Implement ADD opcode logic
          break;
        case Opcode.PUSH.id:
          // Implement PUSH opcode logic
          break;
        case Opcode.CALL.id:
          // Implement CALL opcode logic
          break;
        // Add more opcode handling
      }

      pc++;
    }
  }
}