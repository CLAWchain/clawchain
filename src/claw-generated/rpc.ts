import { simulateTransaction } from './simulate_transaction';

export async function handleRpcRequest(method: string, params: any): Promise<any> {
  switch (method) {
    case 'simulateTransaction':
      return await simulateTransaction(params.transactionData);
    default:
      throw new Error(`Unknown RPC method: ${method}`);
  }
}