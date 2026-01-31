import { Instruction } from './instructions';
import { MerklePatriciaTrie } from '../state';

export class VirtualMachine {
  private stack: number[] = [];
  private memory: Map<number, number> = new Map();
  private programCounter: number = 0;
  private bytecode: Uint8Array;
  private state: MerklePatriciaTrie;

  constructor(bytecode: Uint8Array, state: MerklePatriciaTrie) {
    this.bytecode = bytecode;
    this.state = state;
  }

  execute(): void {
    while (this.programCounter < this.bytecode.length) {
      const instruction = this.bytecode[this.programCounter];
      switch (instruction) {
        case Instruction.PUSH:
          this.programCounter++;
          const value = this.bytecode[this.programCounter];
          this.stack.push(value);
          this.programCounter++;
          break;
        case Instruction.POP:
          this.stack.pop();
          this.programCounter++;
          break;
        case Instruction.ADD:
          const a = this.stack.pop();
          const b = this.stack.pop();
          this.stack.push(a + b);
          this.programCounter++;
          break;
        // Implement other instructions here
        default:
          throw new Error(`Unknown instruction: ${instruction}`);
      }
    }
  }

  getStackTop(): number {
    return this.stack[this.stack.length - 1];
  }

  getMemory(address: number): number {
    return this.memory.get(address) || 0;
  }

  setMemory(address: number, value: number): void {
    this.memory.set(address, value);
  }

  getState(key: string): any {
    return this.state.get(key);
  }

  setState(key: string, value: any): void {
    this.state.insert(key, value);
  }
}