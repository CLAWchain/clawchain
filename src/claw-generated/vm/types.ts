export enum Opcode {
  PUSH = { id: 0x60, gas: 3 },
  POP = { id: 0x50, gas: 2 },
  ADD = { id: 0x01, gas: 3 },
  SUB = { id: 0x02, gas: 3 },
  // Add more opcodes with gas costs
}

export type ContractBytecode = { opcode: Opcode, args?: any[] }[];