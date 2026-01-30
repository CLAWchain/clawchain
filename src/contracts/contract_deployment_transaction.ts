import { Transaction } from '../transaction';
import { keccak256 } from 'js-sha3';

class ContractDeploymentTransaction extends Transaction {
  public contractCode: Uint8Array;
  public salt: string;

  constructor(from: string, gasLimit: number, contractCode: Uint8Array, salt: string) {
    super(from, gasLimit);
    this.contractCode = contractCode;
    this.salt = salt;
  }

  public getContractAddress(): string {
    const deployerAddress = this.from;
    const contractCodeHash = keccak256(this.contractCode);
    const address = `0xff${deployerAddress}${this.salt}${contractCodeHash}`;
    return keccak256(address).slice(0, 40);
  }
}

export { ContractDeploymentTransaction };