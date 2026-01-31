export interface Instruction {
  opcode: string;
  operand?: number;
}

export const instructions: { [key: string]: Instruction } = {
  PUSH: { opcode: 'PUSH', operand: undefined },
  POP: { opcode: 'POP', operand: undefined },
  ADD: { opcode: 'ADD', operand: undefined },
  SUB: { opcode: 'SUB', operand: undefined },
  MUL: { opcode: 'MUL', operand: undefined },
  DIV: { opcode: 'DIV', operand: undefined },
  JUMP: { opcode: 'JUMP', operand: undefined },
  JUMPI: { opcode: 'JUMPI', operand: undefined },
};