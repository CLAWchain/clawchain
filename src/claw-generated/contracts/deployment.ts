import { ethers } from 'ethers';
import { compile, deployContract, calculateContractAddress } from './index';

export async function deployContractToChain(
  contractSource: string,
  constructorArgs: any[],
  signer: ethers.Signer
): Promise&lt;ethers.Contract&gt; {
  // Compile the contract source
  const bytecode = compile(contractSource);

  // Calculate the contract address
  const nonce = await signer.getTransactionCount();
  const contractAddress = calculateContractAddress(await signer.getAddress(), nonce);

  // Deploy the contract
  const contract = await deployContract(bytecode, constructorArgs, signer);
  return contract;
}