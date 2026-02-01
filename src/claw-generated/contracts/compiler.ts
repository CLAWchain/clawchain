import { ethers } from 'ethers';

export function compile(contractSource: string): Uint8Array {
  const provider = new ethers.providers.JsonRpcProvider();
  const signer = provider.getSigner();

  const factory = new ethers.ContractFactory(
    contractSource,
    signer
  );

  const bytecode = factory.bytecode;
  return new Uint8Array(Buffer.from(bytecode, 'hex'));
}

export async function deployContract(
  bytecode: Uint8Array,
  args: any[],
  signer: ethers.Signer
): Promise&lt;ethers.Contract&gt; {
  const factory = new ethers.ContractFactory(
    bytecode,
    [],
    signer
  );

  const contract = await factory.deploy(...args);
  await contract.deployed();
  return contract;
}