import { Transaction } from '../transaction/Transaction';
import { Account } from '../account/Account';
import { ContractCode } from './ContractCode';
import { keccak256 } from 'js-sha3';

export class ContractDeployer {
  constructor(
    private readonly account: Account,
    private readonly contractCode: ContractCode
  ) {}

  async deploy(): Promise<string> {
    // Generate deterministic contract address
    const contractAddress = this.generateContractAddress();

    // Construct deployment transaction
    const tx = this.constructDeploymentTransaction(contractAddress);

    // Sign and submit transaction
    await this.account.signAndSubmitTransaction(tx);

    return contractAddress;
  }

  private generateContractAddress(): string {
    // Calculate contract code hash
    const codeHash = keccak256(this.contractCode.bytecode);

    // Derive contract address from account address and code hash
    const address = '0x' + codeHash.slice(64 - 40);
    return address;
  }

  private constructDeploymentTransaction(
    contractAddress: string
  ): Transaction {
    return new Transaction({
      from: this.account.address,
      to: contractAddress,
      data: this.contractCode.bytecode,
      value: '0',
      nonce: this.account.nextNonce,
      gasLimit: 1000000,
      gasPrice: '10000000000'
    });
  }
}