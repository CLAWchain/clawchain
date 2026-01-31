import { Instruction, VirtualMachine } from './vm';

export class ContractVM extends VirtualMachine {
  constructor() {
    super();
  }

  execute(bytecode: Instruction[]) {
    for (const instruction of bytecode) {
      this.executeInstruction(instruction);
    }
  }
}

export { Instruction, VirtualMachine } from './vm';