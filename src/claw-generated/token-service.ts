import { Contract, providers } from 'ethers';
import { CLAW_TOKEN_ABI, CLAW_TOKEN_ADDRESS } from './constants';

const provider = new providers.JsonRpcProvider('https://rpc.testnet.clawchain.io');
const clawToken = new Contract(CLAW_TOKEN_ADDRESS, CLAW_TOKEN_ABI, provider);

export async function mintTokens(address: string, amount: number): Promise<void> {
  const signer = provider.getSigner();
  const contract = clawToken.connect(signer);
  await contract.mint(address, amount);
}