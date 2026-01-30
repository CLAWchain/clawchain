import { Chain } from '../chain';
import { Transaction } from '../transaction';

export const RpcMethods = {
  getBalance: (params: { address: string }) => {
    const balance = Chain.getBalance(params.address);
    return balance;
  },
  sendTransaction: async (params: { signedTx: string }) => {
    try {
      const txData = Transaction.fromBase64(params.signedTx);
      await Chain.validateAndProcessTransaction(txData);
      return txData.hash;
    } catch (err) {
      console.error('Error processing transaction:', err);
      throw err;
    }
  },
  getTransactionReceipt: (params: { txHash: string }) => {
    const receipt = Chain.getTransactionReceipt(params.txHash);
    return receipt;
  }
};