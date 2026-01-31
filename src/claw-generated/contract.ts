import { VMState } from './vm';
import { Contract as ContractState } from './state';

export class Contract {
  constructor(private vmState: VMState) {}

  call(address: string, value: number, data: Uint8Array, gas: number): Uint8Array {
    // 1. Validate call parameters
    if (!this.vmState.contractExists(address)) {
      throw new Error(`Contract at ${address} does not exist`);
    }

    // 2. Fetch target contract's code and state
    const targetContract = this.vmState.getContract(address);
    const targetContractState = this.vmState.getContractState(address);

    // 3. Create a new VM instance to execute the called contract
    const childVM = new VMState(this.vmState.chainState, targetContract, targetContractState);

    // 4. Forward the remaining gas to the called contract
    const result = childVM.run(data, gas);

    // 5. Handle the return value and any exceptions
    if (childVM.hasError()) {
      throw new Error(`Error in called contract: ${childVM.getError()}`);
    }

    // Update the parent contract's state with the child contract's changes
    this.vmState.mergeContractState(address, childVM.getContractState());

    return result;
  }
}