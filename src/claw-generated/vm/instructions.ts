export interface Instruction {
  opcode: string;
  operand?: number;
}

export const instructions: { [key: string]: Instruction } = {
  PUSH: { opcode: 'PUSH', operand: undefined },
  POP: { opcode: 'POP', operand: undefined },
  ADD: { opcode: 'ADD', operand: undefined },
  SUB: { opcode: 'SUB', operand: undefined },
  MUL: { opcode: 'MUL', operand: undefined },
  DIV: { opcode: 'DIV', operand: undefined },
  JUMP: { opcode: 'JUMP', operand: undefined },
  JUMPI: { opcode: 'JUMPI', operand: undefined },
  CALL: { opcode: 'CALL', operand: undefined },
};

export async function executeInstruction(instruction: Instruction, vm: VirtualMachine): Promise<void> {
  switch (instruction.opcode) {
    case 'PUSH':
      // ...
    case 'POP':
      // ...
    case 'ADD':
      // ...
    case 'SUB':
      // ...
    case 'MUL':
      // ...
    case 'DIV':
      // ...
    case 'JUMP':
      // ...
    case 'JUMPI':
      // ...
    case 'CALL':
      await handleCALLInstruction(vm);
      break;
    default:
      throw new Error(`Unknown opcode: ${instruction.opcode}`);
  }
}

async function handleCALLInstruction(vm: VirtualMachine): Promise<void> {
  // Get the target address from the stack
  const targetAddress = vm.stack.pop();

  // Check if the target is an externally owned account (EOA)
  if (await vm.isExternallyOwnedAccount(targetAddress)) {
    // Forward the call to the EOA's transaction execution logic
    await vm.executeEOATransaction(targetAddress, vm.callData, vm.gas);
  } else {
    // The target is a contract account, handle contract-to-contract calls later
    throw new Error('Contract-to-contract calls not yet implemented');
  }
}