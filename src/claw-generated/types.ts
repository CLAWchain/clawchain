export type OperandSize = 'BYTE' | 'WORD' | 'DWORD';

export interface Instruction {
  opcode: string;
  operand?: number;
  operandSize?: OperandSize;
}