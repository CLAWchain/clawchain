import { VMState, VMMemory, VMStack, VMOpcode } from './types';

class VM {
  private state: VMState = {
    pc: 0, // program counter
    gas: 0, // gas available
    memory: new VMMemory(),
    stack: new VMStack(),
  };

  constructor(initialGas: number) {
    this.state.gas = initialGas;
  }

  execute(code: VMOpcode[]) {
    while (this.state.pc < code.length) {
      const opcode = code[this.state.pc];
      this.executeOpcode(opcode);
      this.state.pc++;
    }
  }

  private executeOpcode(opcode: VMOpcode) {
    switch (opcode.type) {
      case 'PUSH':
        this.state.stack.push(opcode.value);
        break;
      case 'ADD':
        this.state.stack.push(this.state.stack.pop() + this.state.stack.pop());
        break;
      // Add more opcode handlers here
    }
  }
}

export { VM };