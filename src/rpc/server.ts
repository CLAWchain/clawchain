import { RpcMethods } from './methods';

const jsonRpc = {
  getBalance: RpcMethods.getBalance,
  sendTransaction: RpcMethods.sendTransaction,
  getTransactionReceipt: RpcMethods.getTransactionReceipt
};

export function startRpcServer() {
  // Set up JSON-RPC server
  console.log('Starting RPC server...');
}