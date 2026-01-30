import { AccountManager, Account } from './account';
import { Transaction, TransactionReceipt } from './transaction';
import { StateManager } from '../state/StateManager';
import { keccak256 } from 'js-sha3';

class ContractDeployer {
  private accountManager: AccountManager;
  private stateManager: StateManager;

  constructor(accountManager: AccountManager, stateManager: StateManager) {
    this.accountManager = accountManager;
    this.stateManager = stateManager;
  }

  /**
   * Generates a deterministic contract address based on the contract bytecode and deployer address.
   * @param deployerAddress - Address of the contract deployer.
   * @param contractBytecode - Compiled bytecode of the contract.
   * @returns - Deterministic contract address.
   */
  getContractAddress(deployerAddress: Buffer, contractBytecode: Buffer): Buffer {
    const nonce = this.accountManager.getAccount(deployerAddress).nonce;
    const input = Buffer.concat([deployerAddress, contractBytecode, Buffer.from([nonce])]);
    return Buffer.from(keccak256(input), 'hex');
  }

  /**
   * Deploys a contract by executing a deployment transaction.
   * @param deployerAddress - Address of the contract deployer.
   * @param contractBytecode - Compiled bytecode of the contract.
   * @param value - Amount of native tokens to send with the deployment.
   * @param gasLimit - Gas limit for the deployment transaction.
   * @param gasPrice - Gas price for the deployment transaction.
   * @returns - Receipt of the deployment transaction.
   */
  async deployContract(
    deployerAddress: Buffer,
    contractBytecode: Buffer,
    value: bigint,
    gasLimit: number,
    gasPrice: bigint
  ): Promise<TransactionReceipt> {
    const contractAddress = this.getContractAddress(deployerAddress, contractBytecode);
    const deploymentTx = new DeploymentTransaction(
      deployerAddress,
      contractAddress,
      value,
      contractBytecode,
      gasLimit,
      gasPrice
    );

    await deploymentTx.validate();
    const receipt = await deploymentTx.execute();

    // Store the deployed contract metadata
    await this.stateManager.set(`contract:${contractAddress.toString('hex')}`, {
      address: contractAddress,
      bytecode: contractBytecode
    });

    return receipt;
  }
}

class DeploymentTransaction extends Transaction {
  public readonly contractBytecode: Buffer;

  constructor(
    from: Buffer,
    to: Buffer,
    value: bigint,
    contractBytecode: Buffer,
    gasLimit: number,
    gasPrice: bigint
  ) {
    super(from, to, value, Buffer.alloc(0), from.toString('hex'), gasLimit, gasPrice);
    this.contractBytecode = contractBytecode;
  }

  async execute(): Promise<TransactionReceipt> {
    // Execute the deployment logic
    // - Create a new contract account
    // - Execute the contract bytecode
    // - Return the transaction receipt

    const receipt = await super.execute();
    return receipt;
  }
}

export { ContractDeployer, DeploymentTransaction };