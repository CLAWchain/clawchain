import { Response, RequestParams } from 'jsonrpc-lite';
import { getWalletBalance, sendTransactionToChain, getTransactionReceiptFromChain, getBlockFromChain } from '../blockchain';

export async function getBalance(params: RequestParams): Promise<Response> {
  const { address } = params as { address: string };
  const balance = await getWalletBalance(address);
  return {
    jsonrpc: '2.0',
    result: balance,
    id: null
  };
}

export async function sendTransaction(params: RequestParams): Promise<Response> {
  const { transaction } = params as { transaction: any };
  const txHash = await sendTransactionToChain(transaction);
  return {
    jsonrpc: '2.0',
    result: txHash,
    id: null
  };
}

export async function getTransactionReceipt(params: RequestParams): Promise<Response> {
  const { hash } = params as { hash: string };
  const receipt = await getTransactionReceiptFromChain(hash);
  return {
    jsonrpc: '2.0',
    result: receipt,
    id: null
  };
}

export async function getBlockByNumber(params: RequestParams): Promise<Response> {
  const { number } = params as { number: number };
  const block = await getBlockFromChain(number);
  return {
    jsonrpc: '2.0',
    result: block,
    id: null
  };
}