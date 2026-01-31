import { Transaction } from './transaction';
import { VirtualMachine } from './vm';
import { State } from './state';
import { Account } from './state/account';
import { keccak256 } from 'js-sha3';

export class ContractDeployment {
  private vm: VirtualMachine;
  private state: State;

  constructor(vm: VirtualMachine, state: State) {
    this.vm = vm;
    this.state = state;
  }

  deployContract(transaction: Transaction): string {
    // Extract contract bytecode and constructor parameters from the transaction
    const { bytecode, constructorParams } = transaction.getContractDeploymentData();

    // Get the deployer's account
    const deployerAddress = transaction.getSenderAddress();
    const deployerAccount = this.state.getAccount(deployerAddress);

    // Generate the contract address
    const contractAddress = this.generateContractAddress(deployerAddress, deployerAccount.nonce);

    // Deploy the contract using the VM
    this.vm.deployContract(bytecode, constructorParams, contractAddress);

    // Update the deployer's nonce
    deployerAccount.nonce++;
    this.state.updateAccount(deployerAddress, deployerAccount);

    // Store the contract state in the global state trie
    this.state.storeContract(contractAddress, this.vm.getContractState());

    return contractAddress.toString('hex');
  }

  private generateContractAddress(creatorAddress: Buffer, nonce: number): Buffer {
    const input = Buffer.concat([creatorAddress, Buffer.from(nonce.toString())]);
    return Buffer.from(keccak256(input), 'hex');
  }
}