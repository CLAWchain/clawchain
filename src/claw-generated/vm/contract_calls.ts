import { Instruction, OperationHandler, VirtualMachine } from './index';

class ContractCallVM extends VirtualMachine {
  private callStack: { contractAddress: string; returnAddress: number }[] = [];

  executeInstruction(instruction: Instruction): void {
    switch (instruction.opcode) {
      case 0x10: // CALL
        this.handleCall(instruction.operands);
        break;
      case 0x11: // RETURN
        this.handleReturn();
        break;
      default:
        super.executeInstruction(instruction);
    }
  }

  private handleCall(operands: any[]): void {
    const [contractAddress, argCount, gasLimit] = operands;
    // Push return address to stack
    this.stack.push(this.callStack.length);
    // Push current contract address and return address to call stack
    this.callStack.push({ contractAddress, returnAddress: this.stack.length });
    // Execute the called contract
    this.executeContract(contractAddress, argCount, gasLimit);
  }

  private handleReturn(): void {
    // Pop return address from stack
    const returnAddress = this.stack.pop();
    // Pop caller contract address and return address from call stack
    const { contractAddress, returnAddress: callerReturnAddress } = this.callStack.pop();
    // Restore caller's stack and memory state
    this.stack.length = callerReturnAddress;
    // TODO: Restore caller's memory state
    // Resume execution at the return address
    this.executeInstruction({ opcode: 0x11, operands: [contractAddress] });
  }

  private executeContract(contractAddress: string, argCount: number, gasLimit: number): void {
    // TODO: Implement contract execution with gas forwarding and return value handling
  }
}

export { ContractCallVM };