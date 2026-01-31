export interface Opcode {
  name: string;
  operand?: number;
}

export interface ExecutionResult {
  stack: number[];
  memory: number[];
}