import { ethers } from 'ethers';

export class Transaction {
  public static verifySignature(
    senderAddress: string,
    data: string,
    signature: string
  ): boolean {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(data, signature);
      return recoveredAddress === senderAddress;
    } catch (err) {
      console.error('Error verifying transaction signature:', err);
      return false;
    }
  }

  public static async validateNonce(
    senderAddress: string,
    nonce: number,
    stateManager: StateManager
  ): Promise<boolean> {
    const currentNonce = await stateManager.getNonce(senderAddress);
    return nonce === currentNonce;
  }

  public static async validateBalance(
    senderAddress: string,
    amount: ethers.BigNumber,
    stateManager: StateManager
  ): Promise<boolean> {
    const balance = await stateManager.getBalance(senderAddress);
    return balance.gte(amount);
  }
}