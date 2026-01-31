export class Instruction {
  opcode: string;
  operand: any;
  size: number;

  constructor(opcode: string, operand: any, size: number) {
    this.opcode = opcode;
    this.operand = operand;
    this.size = size;
  }

  static decode(bytecode: Uint8Array, offset: number): Instruction {
    const opcode = this.decodeOpcode(bytecode, offset);
    const operand = this.decodeOperand(bytecode, offset, opcode);
    const size = this.instructionSize(opcode, operand);
    return new Instruction(opcode, operand, size);
  }

  private static decodeOpcode(bytecode: Uint8Array, offset: number): string {
    // Decode the opcode from the bytecode
    switch (bytecode[offset]) {
      case 0x00:
        return 'PUSH';
      case 0x01:
        return 'POP';
      case 0x02:
        return 'ADD';
      case 0x03:
        return 'SUB';
      // Add more opcodes as needed
      default:
        throw new Error(`Unknown opcode: ${bytecode[offset]}`);
    }
  }

  private static decodeOperand(bytecode: Uint8Array, offset: number, opcode: string): any {
    // Decode the operand from the bytecode based on the opcode
    switch (opcode) {
      case 'PUSH':
        return bytecode[offset + 1];
      // Add more operand decoding logic as needed
      default:
        return null;
    }
  }

  private static instructionSize(opcode: string, operand: any): number {
    // Determine the size of the instruction based on the opcode and operand
    switch (opcode) {
      case 'PUSH':
        return 2;
      // Add more instruction size logic as needed
      default:
        return 1;
    }
  }
}