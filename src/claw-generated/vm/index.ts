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

    switch (instruction.opcode) {
      case 0x01: // ADD
        this.addInstruction(instruction);
        break;
      case 0x02: // MUL
        this.mulInstruction(instruction);
        break;
      case 0x03: // SUB
        this.subInstruction(instruction);
        break;
      case 0x04: // DIV
        this.divInstruction(instruction);
        break;
      case 0x05: // SDIV
        this.sdivInstruction(instruction);
        break;
      case 0x06: // MOD
        this.modInstruction(instruction);
        break;
      case 0x07: // SMOD
        this.smodInstruction(instruction);
        break;
      case 0x08: // ADDMOD
        this.addmodInstruction(instruction);
        break;
      case 0x09: // MULMOD
        this.mulmodInstruction(instruction);
        break;
      case 0x0a: // EXP
        this.expInstruction(instruction);
        break;
      case 0x0b: // SIGNEXTEND
        this.signextendInstruction(instruction);
        break;
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

  private subInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(a - b);
  }

  private divInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(Math.floor(a / b));
  }

  private sdivInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(Math.floor(Math.sign(a) * Math.sign(b) * Math.floor(Math.abs(a) / Math.abs(b))));
  }

  private modInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(a % b);
  }

  private smodInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(Math.sign(a) * (Math.abs(a) % Math.abs(b)));
  }

  private addmodInstruction(instruction: Instruction) {
    const [a, b, c] = instruction.operands;
    this.state.stack.push((a + b) % c);
  }

  private mulmodInstruction(instruction: Instruction) {
    const [a, b, c] = instruction.operands;
    this.state.stack.push((a * b) % c);
  }

  private expInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    this.state.stack.push(BigInt(a) ** BigInt(b));
  }

  private signextendInstruction(instruction: Instruction) {
    const [a, b] = instruction.operands;
    const bits = (a + 1) * 8;
    const mask = (1 << bits) - 1;
    this.state.stack.push((b << (256 - bits)) >> (256 - bits));
  }
}