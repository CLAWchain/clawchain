import { Instruction, VirtualMachine } from './vm';

export class ContractVM {
  private vm: VirtualMachine;

  constructor() {
    this.vm = new VirtualMachine();
  }

  executeContract(bytecode: Instruction[]) {
    this.vm.execute(bytecode);
  }
}