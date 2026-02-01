export interface Instruction {
  opcode: number;
  operand?: number;
}

export enum Operation {
  ADD,
  SUB,
  MUL,
  DIV,
  JUMP,
  JUMPI,
  PUSH,
  POP,
  LOAD,
  STORE
}