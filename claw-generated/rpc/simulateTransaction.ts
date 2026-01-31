import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { VM } from '../vm';

export async function simulateTransaction(rawTransaction: string): Promise<{ logs: string[], computeUnits: number }> {
  const tx = Transaction.from(Buffer.from(rawTransaction, 'base64'));

  const vm = new VM();
  await vm.load(tx);
  await vm.run();

  return {
    logs: vm.getLogs(),
    computeUnits: vm.getComputeUnits()
  };
}