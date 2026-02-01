import { ExecutionContext } from './types';

export class VM {
  execute(context: ExecutionContext): void {
    const { bytecode, stack, memory } = context;
    let pc = 0; // Program counter

    while (pc < bytecode.length) {
      const opcode = bytecode[pc];
      switch (opcode) {
        case 0x01: // ADD
          {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a + b);
          }
          break;
        case 0x02: // SUB
          {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a - b);
          }
          break;
        case 0x03: // MUL
          {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a * b);
          }
          break;
        case 0x04: // DIV
          {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a / b);
          }
          break;
        default:
          throw new Error(`Unknown opcode: ${opcode}`);
      }
      pc++;
    }
  }
}