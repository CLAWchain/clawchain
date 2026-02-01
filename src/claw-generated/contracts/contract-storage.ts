import { StateTree } from '../state-tree';

export class ContractStorage {
  private stateTree: StateTree;

  constructor(stateTree: StateTree) {
    this.stateTree = stateTree;
  }

  getContractState(contractAddress: string): any {
    return this.stateTree.get(contractAddress);
  }

  setContractState(contractAddress: string, state: any): void {
    this.stateTree.set(contractAddress, state);
  }
}