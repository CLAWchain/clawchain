export type Opcode = {
  name: string;
  operand?: number;
};

export const OPCODES: { [key: string]: Opcode } = {
  PUSH: { name: 'PUSH', operand: 0 },
  POP: { name: 'POP' },
  ADD: { name: 'ADD' },
  MUL: { name: 'MUL' },
  // Add more opcodes as needed
};