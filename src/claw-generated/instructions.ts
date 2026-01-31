// src/claw-generated/instructions.ts
export enum VmInstruction {
  PUSH,
  POP,
  ADD,
  SUB,
  MUL,
  JUMP,
  JUMPI
}

export interface InstructionDefinition {
  opcode: VmInstruction;
  name: string;
  execute: (vm: VirtualMachine) => void;
}

// Implement instruction definitions here