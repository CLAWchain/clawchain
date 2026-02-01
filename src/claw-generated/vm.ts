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
      // ... other opcode handlers
      [Opcode.CALL]: {
        execute: (context) => {
          // 1. Pop the target contract address from the stack
          const targetAddress = context.popStack();

          // 2. Pop the amount of gas to forward from the stack
          const gasToForward = context.popStack();

          // 3. Pop the number of arguments from the stack
          const numArgs = context.popStack();

          // 4. Pop the argument values from the stack
          const args = [];
          for (let i = 0; i < numArgs; i++) {
            args.push(context.popStack());
          }

          // 5. Look up the target contract and execute it
          const targetContract = this.context.getContract(targetAddress);
          const result = targetContract.execute(args, gasToForward);

          // 6. Push the result back onto the stack
          context.pushStack(result);
        },
        gasRequired: 40, // Placeholder value, needs to be refined
      },
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