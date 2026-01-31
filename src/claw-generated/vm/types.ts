export type Instruction = {
  opcode: number;
  operands: any[];
};

export type VMState = {
  memory: Uint8Array;
  stack: any[];
  pc: number;
  gasUsed: number;
  gasLimit: number;
};

export const GAS_COSTS: Record<number, number> = {
  0x00: 0,   // STOP
  0x01: 2,   // ADD
  0x02: 2,   // MUL
  0x03: 5,   // SUB
  0x04: 5,   // DIV
  0x05: 5,   // SDIV
  0x06: 5,   // MOD
  0x07: 5,   // SMOD
  0x08: 3,   // ADDMOD
  0x09: 3,   // MULMOD
  0x0a: 3,   // EXP
  0x0b: 5,   // SIGNEXTEND
  // Add more gas costs for other opcodes...
};