export class VirtualMachine {
  private stack: any[] = [];

  execute(bytecode: Uint8Array) {
    for (let i = 0; i < bytecode.length; i++) {
      const opcode = bytecode[i];
      switch (opcode) {
        case 0x01: // PUSH
          i++;
          const value = bytecode[i];
          this.pushToStack(value);
          break;
        case 0x02: // POP
          this.popFromStack();
          break;
        case 0x03: // ADD
          const b = this.popFromStack();
          const a = this.popFromStack();
          this.pushToStack(a + b);
          break;
        case 0x04: // SUB
          const d = this.popFromStack();
          const c = this.popFromStack();
          this.pushToStack(c - d);
          break;
        // Add more operations as needed
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }

  private pushToStack(value: any) {
    this.stack.push(value);
  }

  private popFromStack(): any {
    return this.stack.pop();
  }
}