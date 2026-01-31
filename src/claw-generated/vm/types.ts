export type Instruction = {
  opcode: string;
  operand?: any;
};

export type VMState = {
  stack: any[];
  pc: number;
  memory: Uint8Array;
};