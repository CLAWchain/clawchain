export enum Opcode {
  STOP = 0x00,
  ADD = 0x01,
  MUL = 0x02,
  // Add more opcodes here
}

export interface Instruction {
  opcode: Opcode;
  operand1?: number;
  operand2?: number;
}