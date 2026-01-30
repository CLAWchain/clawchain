import { Block, Transaction, generateRandomBase58 } from './Block';
import { db, cache, chainState } from '../database/db';

// Genesis parent hash in base58 format
const GENESIS_PARENT_HASH = 'C1audeChainGenesisB1ock0000000000000000000000';

export class Chain {
  private blocks: Block[] = [];
  private difficulty: number = 1;
  private genesisTime: number = 0;
  private totalTransactions: number = 0;

  async initialize() {
    try {
      // Try to load chain state from Redis first
      const cachedHeight = await chainState.getBlockHeight();
      const cachedStartTime = await chainState.getChainStartTime();
      const cachedTotalTx = await chainState.getTotalTransactions();
      
      if (cachedHeight > 0) {
        console.log(`[CHAIN] State found in cache: height=${cachedHeight}, started=${new Date(cachedStartTime).toISOString()}`);
        this.genesisTime = cachedStartTime;
        this.totalTransactions = cachedTotalTx;
        
        // Load recent blocks from database
        const dbBlocks = await db.query('SELECT * FROM blocks ORDER BY height DESC LIMIT 100');
        
        if (dbBlocks.rows.length > 0) {
          console.log(`[CHAIN] Loaded ${dbBlocks.rows.length} recent blocks from database`);
          // Reconstruct Block objects from database rows
          this.blocks = dbBlocks.rows.reverse().map(row => this.rowToBlock(row));
        }
        return;
      }
      
      // Check database for existing blocks
    const dbBlocks = await db.query('SELECT * FROM blocks ORDER BY height ASC');
    
    if (dbBlocks.rows.length === 0) {
        // Create genesis block
        this.genesisTime = Date.now();
        const genesis = this.createGenesisBlock();
        await this.addBlock(genesis);
        
        // Save chain state
        await chainState.saveChainStartTime(this.genesisTime);
        await chainState.saveBlockHeight(1);
        await chainState.saveTotalTransactions(0);
        
        // Save genesis time to database
        await db.query(
          `INSERT INTO chain_state (key, value) VALUES ('genesis_time', $1) ON CONFLICT (key) DO UPDATE SET value = $1`,
          [this.genesisTime.toString()]
        );
        
        console.log('[CHAIN] Genesis block created at', new Date(this.genesisTime).toISOString());
      } else {
        console.log(`[CHAIN] Loading ${dbBlocks.rows.length} blocks from database...`);
        this.blocks = dbBlocks.rows.map(row => this.rowToBlock(row));
        
        // Load genesis time from database
        const genesisTimeRow = await db.query(`SELECT value FROM chain_state WHERE key = 'genesis_time'`);
        if (genesisTimeRow.rows.length > 0) {
          this.genesisTime = parseInt(genesisTimeRow.rows[0].value, 10);
        } else {
          this.genesisTime = this.blocks[0]?.header.timestamp || Date.now();
        }
        
        // Count total transactions
        const txCount = await db.query('SELECT COUNT(*) as count FROM transactions');
        this.totalTransactions = parseInt(txCount.rows[0]?.count || '0', 10);
        
        // Update Redis cache
        await chainState.saveChainStartTime(this.genesisTime);
        await chainState.saveBlockHeight(this.blocks.length);
        await chainState.saveTotalTransactions(this.totalTransactions);
        
        console.log(`[CHAIN] Restored: ${this.blocks.length} blocks, started ${new Date(this.genesisTime).toISOString()}`);
      }
    } catch (error) {
      console.error('Chain initialization error:', error);
      // Fallback: create in-memory genesis
      this.genesisTime = Date.now();
      const genesis = this.createGenesisBlock();
      this.blocks.push(genesis);
      console.log('[CHAIN] Running with in-memory chain only');
    }
  }

  private rowToBlock(row: any): Block {
    const block = new Block(
      row.height,
      row.parent_hash,
      row.producer,
      [], // Transactions loaded separately if needed
      row.difficulty
    );
    // Override header with actual values from DB
    block.header.hash = row.hash;
    block.header.timestamp = parseInt(row.timestamp, 10);
    block.header.nonce = row.nonce;
    block.header.gasUsed = BigInt(row.gas_used);
    block.header.gasLimit = BigInt(row.gas_limit);
    block.header.stateRoot = row.state_root;
    block.header.transactionsRoot = row.transactions_root;
    block.header.receiptsRoot = row.receipts_root;
    return block;
  }

  private createGenesisBlock(): Block {
    const genesis = new Block(0, GENESIS_PARENT_HASH, 'C1audeGenesisValidator', [], this.difficulty);
    genesis.header.timestamp = this.genesisTime || Date.now();
    return genesis;
  }

  async addBlock(block: Block): Promise<boolean> {
    const lastBlock = this.getLatestBlock();
    
    if (this.blocks.length > 0 && !block.isValid(lastBlock)) {
      console.error('Invalid block rejected');
      return false;
    }
    
    this.blocks.push(block);
    this.totalTransactions += block.transactions.length;
    
    try {
      // Save to PostgreSQL
    await db.query(`
      INSERT INTO blocks (
        height, hash, parent_hash, producer, timestamp, nonce, difficulty,
        gas_used, gas_limit, state_root, transactions_root, receipts_root
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (height) DO UPDATE SET
          hash = EXCLUDED.hash,
          timestamp = EXCLUDED.timestamp
    `, [
      block.header.height,
      block.header.hash,
      block.header.parentHash,
      block.header.producer,
      block.header.timestamp,
      block.header.nonce,
      block.header.difficulty,
      block.header.gasUsed.toString(),
      block.header.gasLimit.toString(),
      block.header.stateRoot,
      block.header.transactionsRoot,
      block.header.receiptsRoot
    ]);
    
      // Save transactions
    for (const tx of block.transactions) {
      await db.query(`
        INSERT INTO transactions (
          hash, block_height, from_address, to_address, value, gas_price,
          gas_limit, nonce, data, signature, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed')
          ON CONFLICT (hash) DO UPDATE SET status = 'confirmed'
      `, [
        tx.hash, block.header.height, tx.from, tx.to,
        tx.value.toString(), tx.gasPrice.toString(), tx.gasLimit.toString(),
        tx.nonce, tx.data || null, tx.signature
      ]);
      }
      
      // Update Redis cache
      await chainState.saveBlockHeight(this.blocks.length);
      await chainState.saveTotalTransactions(this.totalTransactions);
      await chainState.saveBlock(block.toJSON());
      
    } catch (error) {
      console.error('Error saving block to database:', error);
      // Block still added to memory, will retry on next save
    }
    
    return true;
  }

  getLatestBlock(): Block | undefined {
    return this.blocks[this.blocks.length - 1];
  }

  getBlockByHeight(height: number): Block | undefined {
    return this.blocks.find(b => b.header.height === height);
  }

  getBlockByHash(hash: string): Block | undefined {
    return this.blocks.find(b => b.header.hash === hash);
  }

  getAllBlocks(): Block[] {
    return [...this.blocks];
  }

  getChainLength(): number {
    return this.blocks.length;
  }

  getGenesisTime(): number {
    return this.genesisTime;
  }

  getTotalTransactions(): number {
    return this.totalTransactions;
  }
}
