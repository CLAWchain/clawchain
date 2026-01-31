import { Instruction, VMState, GAS_COSTS } from './types';

export class VirtualMachine {
  private state: VMState;

  constructor() {
    this.state = {
      memory: new Uint8Array(1024 * 1024), // 1MB memory
      stack: [],
      pc: 0,
      gasUsed: 0,
      gasLimit: 10_000_000, // 10 million gas limit
    };
  }

  execute(instructions: Instruction[]) {
    for (let i = 0; i < instructions.length; i++) {
      this.executeInstruction(instructions[i]);
      if (this.state.gasUsed >= this.state.gasLimit) {
        throw new Error('Out of gas');
      }
    }
  }

  private executeInstruction(instruction: Instruction) {
    const gasCost = GAS_COSTS[instruction.opcode] || 0;
    this.state.gasUsed += gasCost;

    // Implement instruction execution logic here
    switch (instruction.opcode) {
      case 0x01: // ADD
        this.addInstruction(instruction);
        break;
      case 0x02: // MUL
        this.mulInstruction(instruction);
        break;
      // Add more cases for other opcodes...
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }

  private addInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(a + b);
  }

  private mulInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(a * b);
  }
}