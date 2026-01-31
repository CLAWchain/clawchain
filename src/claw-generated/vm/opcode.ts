export enum Opcode {
  ADD = { id: 0x01, name: 'ADD', gas: 3 },
  PUSH = { id: 0x60, name: 'PUSH', gas: 3 },
  CALL = { id: 0xF1, name: 'CALL', gas: 40 },
  // Add more opcodes and their gas costs
}