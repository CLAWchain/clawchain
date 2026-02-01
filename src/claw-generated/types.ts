export type Instruction = {
  opcode: 'PUSH' | 'POP' | 'ADD' | 'MUL';
  operand?: any;
};

export type VmState = {
  stack: any[];
  pc: number;
};