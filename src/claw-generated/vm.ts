// vm.ts

export class VirtualMachine {
  private stack: number[] = [];
  private pc: number = 0; // program counter
  private callStack: number[] = []; // for contract calls

  push(value: number) {
    this.stack.push(value);
  }

  pop(): number {
    return this.stack.pop() as number;
  }

  add() {
    const b = this.pop();
    const a = this.pop();
    this.push(a + b);
  }

  sub() {
    const b = this.pop();
    const a = this.pop();
    this.push(a - b);
  }

  mul() {
    const b = this.pop();
    const a = this.pop();
    this.push(a * b);
  }

  div() {
    const b = this.pop();
    const a = this.pop();
    this.push(a / b);
  }

  and() {
    const b = this.pop();
    const a = this.pop();
    this.push(a & b);
  }

  or() {
    const b = this.pop();
    const a = this.pop();
    this.push(a | b);
  }

  not() {
    const a = this.pop();
    this.push(~a);
  }

  jump(address: number) {
    this.pc = address;
  }

  jumpi(condition: number, address: number) {
    if (condition !== 0) {
      this.pc = address;
    } else {
      this.pc += 1;
    }
  }

  call(address: number) {
    this.callStack.push(this.pc);
    this.pc = address;
  }

  return() {
    this.pc = this.callStack.pop() as number;
  }

  run(bytecode: number[]) {
    while (this.pc < bytecode.length) {
      const opcode = bytecode[this.pc];
      switch (opcode) {
        case 0x01: // ADD
          this.add();
          this.pc += 1;
          break;
        case 0x02: // SUB
          this.sub();
          this.pc += 1;
          break;
        case 0x03: // MUL
          this.mul();
          this.pc += 1;
          break;
        case 0x04: // DIV
          this.div();
          this.pc += 1;
          break;
        case 0x10: // AND
          this.and();
          this.pc += 1;
          break;
        case 0x11: // OR
          this.or();
          this.pc += 1;
          break;
        case 0x12: // NOT
          this.not();
          this.pc += 1;
          break;
        case 0x20: // JUMP
          this.jump(bytecode[this.pc + 1]);
          this.pc += 2;
          break;
        case 0x21: // JUMPI
          this.jumpi(this.pop(), bytecode[this.pc + 1]);
          this.pc += 2;
          break;
        case 0x30: // CALL
          this.call(bytecode[this.pc + 1]);
          this.pc += 2;
          break;
        case 0x31: // RETURN
          this.return();
          break;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
    }
  }
}