import { Chain } from '../chain';

export const RpcMethods = {
  getBalance: (params: { address: string }) => {
    const balance = Chain.getBalance(params.address);
    return balance;
  },
  sendTransaction: (params: { from: string; to: string; value: number }) => {
    const txHash = Chain.sendTransaction(params.from, params.to, params.value);
    return txHash;
  },
  getTransactionReceipt: (params: { txHash: string }) => {
    const receipt = Chain.getTransactionReceipt(params.txHash);
    return receipt;
  }
};