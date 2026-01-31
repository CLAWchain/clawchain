export type Instruction = {
  opcode: 'PUSH' | 'POP' | 'ADD' | 'SUB';
  operand?: number;
};

export type ExecutionContext = {
  // Add any necessary context information here
};