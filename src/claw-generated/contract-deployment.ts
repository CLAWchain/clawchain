import { keccak256 } from 'js-sha3';
import { AccountStorage } from './account-storage';

const accountStorage = new AccountStorage();

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
  // TODO: Implement contract deployment transaction
  const contractAddress = await generateContractAddress(deployer, bytecode);
  const nonce = await fetchNonce(deployer);
  accountStorage.set(deployer, 'nonce', nonce.add(1));
  return contractAddress;
}