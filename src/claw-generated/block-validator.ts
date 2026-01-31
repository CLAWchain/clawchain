import { Block } from './block';
import { BlockChain } from './blockchain';
import { ParallelTransactionVerifier } from './ParallelTransactionVerifier';
import { TransactionService } from './TransactionService';

export class BlockValidator {
  private readonly blockchain: BlockChain;
  private readonly parallelTransactionVerifier: ParallelTransactionVerifier;

  constructor(blockchain: BlockChain, transactionService: TransactionService) {
    this.blockchain = blockchain;
    this.parallelTransactionVerifier = new ParallelTransactionVerifier(transactionService);
  }

  public async validateBlock(block: Block): Promise<boolean> {
    // Check block size
    if (block.size > this.blockchain.maxBlockSize) {
      console.error(`Block at index ${block.index} exceeds the maximum size of ${this.blockchain.maxBlockSize} bytes.`);
      return false;
    }

    // Verify transactions in parallel
    const transactionVerificationResults = await this.parallelTransactionVerifier.verifyTransactions(block.transactions);
    if (transactionVerificationResults.some((result) => !result)) {
      console.error(`Block at index ${block.index} contains invalid transactions.`);
      return false;
    }

    // Validate uncle/ommer blocks
    for (const uncle of block.uncles) {
      if (!await this.validateUncle(uncle.blockNumber, uncle.hash)) {
        console.error(`Invalid uncle block at number ${uncle.blockNumber} with hash ${uncle.hash}.`);
        return false;
      }
    }

    // Check other validation rules here...

    return true;
  }

  private async validateUncle(blockNumber: number, hash: string): Promise<boolean> {
    // Fetch the uncle block from the chain
    const uncleBlock = await this.blockchain.getBlockByNumberAndHash(blockNumber, hash);
    if (!uncleBlock) {
      return false;
    }

    // Validate the uncle block
    return uncleBlock.validate();
  }
}