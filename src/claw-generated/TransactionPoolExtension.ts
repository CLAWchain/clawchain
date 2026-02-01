import { Transaction, TransactionPool, ValidationResult } from '../blockchain/TransactionPool';

// Gas cost formula: 21000 + 16 * data.length
function calculateGasCost(tx: Transaction): bigint {
  const dataSize = tx.data ? tx.data.length : 0;
  return 21000n + 16n * BigInt(dataSize);
}

export class TransactionPoolExtension extends TransactionPool {
  async validateTransaction(tx: Transaction): Promise<ValidationResult> {
    const validation = await super.validateTransaction(tx);
    if (!validation.valid) {
      return validation;
    }

    // Calculate gas cost
    const gasCost = calculateGasCost(tx);

    // Check gas limit
    if (tx.gasLimit < gasCost) {
      return { valid: false, error: `Gas limit too low (needed: ${gasCost})` };
    }

    // Check total cost
    const totalCost = tx.value + (tx.gasPrice * gasCost);
    if (stateManager.getBalance(tx.from) < totalCost) {
      return { valid: false, error: `Insufficient balance: has ${stateManager.getBalance(tx.from)}, needs ${totalCost}` };
    }

    // Update transaction with calculated gas cost
    tx.gasLimit = gasCost;

    return { valid: true };
  }

  async addTransaction(tx: Transaction): Promise<ValidationResult> {
    const validation = await this.validateTransaction(tx);
    if (!validation.valid) {
      return validation;
    }

    // Deduct fee from sender's balance
    const totalCost = tx.value + (tx.gasPrice * tx.gasLimit);
    stateManager.deductBalance(tx.from, totalCost);

    // Add fee to block reward
    stateManager.addToBlockReward(tx.gasPrice * tx.gasLimit);

    await super.addTransaction(tx);
    return { valid: true };
  }
}