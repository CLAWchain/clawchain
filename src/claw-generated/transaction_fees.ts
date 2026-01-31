import { Transaction } from './transaction';

const BASE_FEE_RATE = 0.00001; // 0.001% per byte

export function calculateFee(tx: Transaction): number {
  const size = tx.serialize().length;
  const numInputs = tx.inputs.length;
  const numOutputs = tx.outputs.length;
  let fee = size * BASE_FEE_RATE;

  // Add fee for contract execution complexity
  if (tx.contractCall) {
    fee += tx.contractCall.complexity * 0.01; // 1% per unit of complexity
  }

  // Add fee for number of inputs/outputs
  fee += (numInputs + numOutputs) * 0.001; // 0.1% per input/output

  return fee;
}