export enum Opcode {
  PUSH = 0x01,
  POP = 0x02,
  ADD = 0x03,
  SUB = 0x04,
  MUL = 0x05,
  DIV = 0x06,
  JUMP = 0x07,
  JUMPI = 0x08,
  STOP = 0xFF
}

export interface ExecutionContext {
  stack: number[];
  memory: Uint8Array;
  pc: number; // program counter
}