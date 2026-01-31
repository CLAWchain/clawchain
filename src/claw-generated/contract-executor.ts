import { VirtualMachine } from './vm';
import { ContractLoader } from './contract-loader';

export class ContractExecutor {
  private vm: VirtualMachine;
  private contractLoader: ContractLoader;

  constructor() {
    this.vm = new VirtualMachine();
    this.contractLoader = new ContractLoader();
  }

  executeContract(bytecode: Uint8Array) {
    const verifiedBytecode = this.contractLoader.loadAndVerifyContract(bytecode);
    this.vm.execute(verifiedBytecode);
  }
}