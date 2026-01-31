import { keccak256 } from 'js-sha3';
import { AccountStorage } from './account-storage';
import { TransactionProcessor } from './transaction-processor';
import { VMState } from './vm';

const accountStorage = new AccountStorage();
const transactionProcessor = new TransactionProcessor();

export async function generateContractAddress(
  deployer: string,
  bytecode: string
): Promise<string> {
  const nonce = await fetchNonce(deployer);
  const input = `${deployer}${nonce.toString(16).padStart(64, '0')}${bytecode.slice(2)}`;
  return '0x' + keccak256(input).slice(64 - 40);
}

async function fetchNonce(address: string): Promise<number> {
  const nonce = accountStorage.get(address, 'nonce');
  return nonce.toNumber();
}

export async function deployContract(
  deployer: string,
  bytecode: string,
  ...args: any[]
): Promise<string> {
  const contractAddress = await generateContractAddress(deployer, bytecode);
  const nonce = await fetchNonce(deployer);

  // Create a new transaction to deploy the contract
  const tx = {
    from: deployer,
    to: '0x0000000000000000000000000000000000000000',
    value: 0,
    data: `0x${bytecode}${encodeConstructorArgs(args)}`,
    nonce,
    gasLimit: 5000000,
    gasPrice: 1000000000
  };

  // Process the contract deployment transaction
  await transactionProcessor.processTransaction(tx);

  // Update the deployer's nonce
  accountStorage.set(deployer, 'nonce', nonce + 1);

  return contractAddress;
}

function encodeConstructorArgs(args: any[]): string {
  return args.reduce((encoded, arg) => encoded + arg.toString(16).padStart(64, '0'), '');
}