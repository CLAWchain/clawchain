// src/claw-generated/vm/index.ts
import { Contract } from '../types';
import { Opcode, opcodeImplementations } from './opcodes';

export class VirtualMachine {
  private stack: any[] = [];
  private programCounter: number = 0;

  constructor() {
    // Initialize the VM
  }

  execute(contract: Contract): void {
    while (this.programCounter < contract.bytecode.length) {
      const opcode = contract.bytecode[this.programCounter] as Opcode;
      opcodeImplementations[opcode](this);
      this.programCounter++;
    }
  }

  push(value: any): void {
    this.stack.push(value);
  }

  pop(): any {
    return this.stack.pop();
  }
}