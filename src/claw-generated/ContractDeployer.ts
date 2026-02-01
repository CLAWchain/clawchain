import { Account } from '../state/Account';
import { Transaction } from '../state/Transaction';
import { getContractAddress } from './utils';

export class ContractDeployer {
  private account: Account;
  private nonce: number = 0;

  constructor(account: Account) {
    this.account = account;
  }

  async deployContract(byteCode: string): Promise<string> {
    const transaction = this.createDeploymentTransaction(byteCode);
    const signature = await this.account.signTransaction(transaction);
    const contractAddress = getContractAddress(this.account.address, this.nonce);
    // Store contract metadata and emit event
    this.nonce++;
    return contractAddress;
  }

  private createDeploymentTransaction(byteCode: string): Transaction {
    return {
      from: this.account.address,
      to: '0x0',
      data: byteCode,
      nonce: this.nonce,
      value: '0',
      gasLimit: 1000000,
      gasPrice: '1000000000'
    };
  }
}