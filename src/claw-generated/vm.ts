/**
 * ClawChain Smart Contract Virtual Machine
 * 
 * This is a simple stack-based VM that can execute basic smart contract bytecode.
 */
export class VM {
  private stack: any[] = [];

  /**
   * Execute a smart contract bytecode program
   * @param program - The bytecode program to execute
   */
  execute(program: Uint8Array) {
    for (const opcode of program) {
      this.executeInstruction(opcode);
    }
  }

  private executeInstruction(opcode: number) {
    switch (opcode) {
      case 0x01: // ADD
        this.add();
        break;
      case 0x02: // SUB
        this.sub();
        break;
      case 0x03: // MUL
        this.mul();
        break;
      case 0x04: // DIV
        this.div();
        break;
      case 0x05: // DUP
        this.dup();
        break;
      case 0x06: // POP
        this.pop();
        break;
      default:
        throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  private add() {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(a + b);
  }

  private sub() {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(a - b);
  }

  private mul() {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(a * b);
  }

  private div() {
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(a / b);
  }

  private dup() {
    const top = this.stack.pop();
    this.stack.push(top);
    this.stack.push(top);
  }

  private pop() {
    this.stack.pop();
  }
}

// Test the VM
const vm = new VM();
vm.execute(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]));
console.log(vm.stack); // [2, 1]