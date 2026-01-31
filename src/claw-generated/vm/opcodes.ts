import { Memory } from './memory';
import { Stack } from './stack';

export interface Opcode {
  gasCost: number;
  execute: OpcodeExecutor;
}

export const OpcodeExecutor: { [key: number]: Opcode } = {
  0x01: {
    gasCost: 3,
    execute: (memory: Memory, stack: Stack) => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(a + b);
    }
  },
  // Add more opcodes here
};