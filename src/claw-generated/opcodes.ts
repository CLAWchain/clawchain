export enum Opcode {
  STOP = 0x00,
  ADD = 0x01,
  // ... other existing opcodes
  CALL = 0xF1,
}

export interface OpcodeHandler {
  execute(context: ExecutionContext): void;
  gasRequired: number;
}