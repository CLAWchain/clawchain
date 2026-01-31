import { ContractState } from '../contracts/contract-state';
import { ExecutionContext } from './execution-context';

export class VM {
  private contractState: ContractState;

  constructor(contractState: ContractState) {
    this.contractState = contractState;
  }

  execute(context: ExecutionContext): void {
    switch (context.opcode) {
      case 'CALL':
        this.handleCall(context);
        break;
      // Handle other opcodes here
      default:
        throw new Error(`Unsupported opcode: ${context.opcode}`);
    }
  }

  private handleCall(context: ExecutionContext): void {
    // Implement CALL opcode logic here
  }
}