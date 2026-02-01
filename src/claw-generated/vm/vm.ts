import { Opcode, Instruction } from './instruction';

export class VM {
  private memory: Uint8Array;
  private pc: number = 0;
  private gas: number = 0;

  constructor(initialMemory: Uint8Array) {
    this.memory = initialMemory;
  }

  execute(gas: number): void {
    this.gas = gas;
    while (this.gas > 0) {
      const instruction = this.fetchInstruction();
      this.executeInstruction(instruction);
    }
    // Halt execution if gas is depleted
    console.log('VM halted due to insufficient gas');
  }

  private fetchInstruction(): Instruction {
    const opcode = this.memory[this.pc];
    const instruction: Instruction = {
      opcode: opcode as Opcode,
    };
    this.pc += 1;
    return instruction;
  }

  private executeInstruction(instruction: Instruction): void {
    switch (instruction.opcode) {
      case Opcode.STOP:
        return;
      case Opcode.ADD:
        this.add(instruction);
        break;
      case Opcode.MUL:
        this.mul(instruction);
        break;
      // Add more opcode handlers here
    }
  }

  private add(instruction: Instruction): void {
    const operand1 = this.memory[this.pc];
    const operand2 = this.memory[this.pc + 1];
    this.memory[this.pc + 2] = operand1 + operand2;
    this.pc += 3;
    this.gas -= 1; // Deduct gas for ADD operation
  }

  private mul(instruction: Instruction): void {
    const operand1 = this.memory[this.pc];
    const operand2 = this.memory[this.pc + 1];
    this.memory[this.pc + 2] = operand1 * operand2;
    this.pc += 3;
    this.gas -= 2; // Deduct gas for MUL operation
  }
}