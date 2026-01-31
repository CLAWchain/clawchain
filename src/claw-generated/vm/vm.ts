export type Instruction = {
  opcode: string;
  params?: any[];
};

export class VirtualMachine {
  private stack: any[] = [];

  executeInstruction(instruction: Instruction) {
    switch (instruction.opcode) {
      case 'PUSH':
        this.stack.push(instruction.params?.[0]);
        break;
      case 'POP':
        this.stack.pop();
        break;
      case 'ADD':
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a + b);
        break;
      case 'MUL':
        const d = this.stack.pop();
        const c = this.stack.pop();
        this.stack.push(c * d);
        break;
      default:
        throw new Error(`Unknown opcode: ${instruction.opcode}`);
    }
  }
}