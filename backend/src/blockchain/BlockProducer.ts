import { Chain } from './Chain';
import { Block, Transaction } from './Block';
import { TransactionPool } from './TransactionPool';
import { ValidatorManager } from '../validators/ValidatorManager';
import { EventBus } from '../events/EventBus';
import { stateManager } from './StateManager';

export class BlockProducer {
  private chain: Chain;
  private txPool: TransactionPool;
  private validatorManager: ValidatorManager;
  private eventBus: EventBus;
  private isProducing: boolean = false;
  private productionInterval: NodeJS.Timeout | null = null;

  constructor(
    chain: Chain,
    txPool: TransactionPool,
    validatorManager: ValidatorManager,
    eventBus: EventBus
  ) {
    this.chain = chain;
    this.txPool = txPool;
    this.validatorManager = validatorManager;
    this.eventBus = eventBus;
  }

  start() {
    if (this.isProducing) return;
    
    this.isProducing = true;
    console.log('[PRODUCER] Block production started - 10 second intervals');
    
    this.produceBlock();
    
    this.productionInterval = setInterval(() => {
      this.produceBlock();
    }, 10000);
  }

  stop() {
    if (this.productionInterval) {
      clearInterval(this.productionInterval);
      this.productionInterval = null;
    }
    this.isProducing = false;
    console.log('[PRODUCER] Block production stopped');
  }

  private async produceBlock() {
    try {
      const validator = await this.validatorManager.selectProducer();
      
      if (!validator) {
        console.error('[PRODUCER] No validator available for block production');
        return;
      }
      
      const blockHeight = this.chain.getChainLength();
      console.log(`\n[PRODUCER] Producing block #${blockHeight} [${validator.name}]`);
      
      const pendingTxs = await this.txPool.getPendingTransactions(100);
      
      // Apply transactions to state and filter valid ones
      const validTxs: Transaction[] = [];
      for (const tx of pendingTxs) {
        const applied = await stateManager.applyTransaction(tx, blockHeight);
        if (applied) {
          validTxs.push(tx);
          console.log(`   TX: ${tx.from.substring(0, 8)}... -> ${tx.to.substring(0, 8)}... (${stateManager.formatBalance(tx.value)})`);
        }
      }
      
      console.log(`   Including ${validTxs.length}/${pendingTxs.length} valid transactions`);
      
      // Apply block reward to producer
      const BLOCK_REWARD = 10n * 10n**18n; // 10 CLAW per block
      await stateManager.applyBlockReward(validator.address, blockHeight, BLOCK_REWARD);
      console.log(`   Block reward: ${stateManager.formatBalance(BLOCK_REWARD)} to ${validator.name}`);
      
      // Commit state changes and get new state root
      const newStateRoot = await stateManager.commitBlock(blockHeight);
      
      const lastBlock = this.chain.getLatestBlock();
      const genesisParentHash = 'C1audeChainGenesisB1ock0000000000000000000000';
      const newBlock = new Block(
        lastBlock ? lastBlock.header.height + 1 : 0,
        lastBlock ? lastBlock.header.hash : genesisParentHash,
        validator.address,
        validTxs
      );
      
      // Set the real state root from StateManager
      newBlock.setStateRoot(newStateRoot);
      console.log(`   State Root: ${newStateRoot.substring(0, 20)}...`);
      
      const isValid = await validator.validateBlock(newBlock);
      
      if (!isValid) {
        console.error(`[PRODUCER] Validator ${validator.name} rejected their own block`);
        return;
      }
      
      const consensusReached = await this.validatorManager.getConsensus(newBlock);
      
      if (!consensusReached) {
        console.error('[PRODUCER] Consensus not reached - block rejected');
        this.eventBus.emit('consensus_failed', {
          block: newBlock.toJSON(),
          timestamp: Date.now()
        });
        return;
      }
      
      const added = await this.chain.addBlock(newBlock);
      
      if (added) {
        console.log(`[PRODUCER] Block #${newBlock.header.height} added to chain`);
        console.log(`   Hash: ${newBlock.header.hash.substring(0, 20)}...`);
        console.log(`   Gas Used: ${newBlock.header.gasUsed.toString()}`);
        
        await this.txPool.removeTransactions(pendingTxs.map(tx => tx.hash));
        
        await this.validatorManager.recordBlockProduced(validator.address);
        
        this.eventBus.emit('block_produced', {
          block: newBlock.toJSON(),
          producer: validator.name,
          stateRoot: newStateRoot,
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      console.error('[PRODUCER] Error producing block:', error);
    }
  }
}

