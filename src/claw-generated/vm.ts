import { ExecutionContext } from './context';
import { Opcode, OpcodeHandler } from './opcodes';

export class VirtualMachine {
  private context: ExecutionContext;
  private opcodes: Record<Opcode, OpcodeHandler>;
  private gasLimit: number;
  private gasUsed: number;

  constructor(gasLimit: number) {
    this.context = new ExecutionContext();
    this.opcodes = {
      // Define opcode handlers here
    };
    this.gasLimit = gasLimit;
    this.gasUsed = 0;
  }

  execute(code: Uint8Array): void {
    // Implement VM execution loop with gas metering
    for (let i = 0; i < code.length; i++) {
      const opcode = code[i];
      const handler = this.opcodes[opcode];
      if (!handler) {
        throw new Error(`Unknown opcode: ${opcode}`);
      }

      const gasRequired = handler.gasRequired;
      if (this.gasUsed + gasRequired > this.gasLimit) {
        throw new Error('Insufficient gas');
      }

      handler.execute(this.context);
      this.gasUsed += gasRequired;
    }
  }

  getGasUsed(): number {
    return this.gasUsed;
  }
}