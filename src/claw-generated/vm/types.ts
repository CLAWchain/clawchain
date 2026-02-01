export enum Opcode {
  PUSH = 0x60,
  POP = 0x50,
  // Add more opcodes here
}

export type ContractBytecode = Opcode[];