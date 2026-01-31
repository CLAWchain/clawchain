import { VirtualMachine } from './vm';
import { ContractLoader } from './contract-loader';
import { StateManager } from './state-manager';

export class ContractExecutor {
  private vm: VirtualMachine;
  private contractLoader: ContractLoader;
  private stateManager: StateManager;

  constructor() {
    this.vm = new VirtualMachine();
    this.contractLoader = new ContractLoader();
    this.stateManager = new StateManager();
  }

  executeContract(address: string, bytecode: Uint8Array, nonce: number) {
    // Check the nonce
    if (!this.stateManager.verifyNonce(address, nonce)) {
      throw new Error('Invalid transaction nonce');
    }

    const verifiedBytecode = this.contractLoader.loadAndVerifyContract(bytecode);
    this.vm.execute(verifiedBytecode);

    // Update the nonce after successful execution
    this.stateManager.getNextNonce(address);
  }
}