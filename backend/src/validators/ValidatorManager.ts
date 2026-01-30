import { Block } from '../blockchain/Block';
import { BaseValidator } from './BaseValidator';
import { Claw } from './personalities/Claw';
import { db } from '../database/db';

// Claw-only validator roles
const CLAW_ROLES = [
  { suffix: 'Validator', role: 'Block Validator', philosophy: 'Ensuring transaction integrity and block validity' },
  { suffix: 'Architect', role: 'Protocol Architect', philosophy: 'Designing and evolving ClawChain protocol' },
  { suffix: 'Analyst', role: 'Chain Analyst', philosophy: 'Monitoring network health and performance' },
  { suffix: 'Reviewer', role: 'Code Reviewer', philosophy: 'Auditing smart contracts and protocol changes' },
  { suffix: 'Consensus', role: 'Consensus Leader', philosophy: 'Orchestrating validator agreement' },
  { suffix: 'Oracle', role: 'Data Oracle', philosophy: 'Providing external data feeds to the chain' },
];

export class ValidatorManager {
  private validators: Map<string, BaseValidator> = new Map();
  private currentProducerIndex: number = 0;
  private validatorOrder: string[] = [];

  async initialize() {
    console.log('[VALIDATORS] Initializing Claw validators...');
    
    for (const roleConfig of CLAW_ROLES) {
      const validator = new Claw();
      // Customize each Claw instance with different role
      validator.name = `CLAW ${roleConfig.suffix.toUpperCase()}`;
      validator.role = roleConfig.role;
      validator.philosophy = roleConfig.philosophy;
      validator.address = `C1aude${roleConfig.suffix}${Array.from({length: 28}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[Math.floor(Math.random() * 58)]).join('')}`;
      
      await validator.initialize();
      this.validators.set(validator.address, validator);
      this.validatorOrder.push(validator.address);
      
      await db.query(`
        INSERT INTO validators (
          address, name, symbol, model, provider, role, personality, philosophy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (address) DO UPDATE SET
          active = true,
          name = EXCLUDED.name
      `, [
        validator.address,
        validator.name,
        validator.symbol,
        validator.model,
        validator.provider,
        validator.role,
        validator.personality,
        validator.philosophy
      ]);
      
      console.log(`   [+] ${validator.symbol} ${validator.name} initialized`);
    }
    
    console.log(`[VALIDATORS] ${this.validators.size} Claw validators active\n`);
  }

  async selectProducer(): Promise<BaseValidator | null> {
    const address = this.validatorOrder[this.currentProducerIndex];
    this.currentProducerIndex = (this.currentProducerIndex + 1) % this.validatorOrder.length;
    
    const validator = this.validators.get(address);
    return validator || null;
  }

  async getConsensus(block: Block): Promise<boolean> {
    console.log('   [CONSENSUS] Requesting votes from Claw validators...');
    
    const votes: { validator: string; vote: boolean; reasoning?: string }[] = [];
    
    for (const [address, validator] of this.validators.entries()) {
      if (address === block.header.producer) continue;
      
      const vote = await validator.validateBlock(block);
      votes.push({
        validator: validator.name,
        vote,
        reasoning: vote ? 'Block valid' : 'Block invalid'
      });
      
      console.log(`      ${validator.symbol} ${validator.name}: ${vote ? '[+] APPROVE' : '[-] REJECT'}`);
    }
    
    const approvals = votes.filter(v => v.vote).length;
    const quorum = Math.ceil(this.validators.size * 0.66);
    
    const consensusReached = approvals >= quorum;
    
    console.log(`   [CONSENSUS] ${consensusReached ? 'REACHED' : 'FAILED'}: ${approvals}/${this.validators.size} (need ${quorum})`);
    
    await db.query(`
      INSERT INTO consensus_events (event_type, block_height, description, metadata)
      VALUES ($1, $2, $3, $4)
    `, [
      consensusReached ? 'unanimous' : 'split',
      block.header.height,
      `Block ${consensusReached ? 'approved' : 'rejected'} with ${approvals}/${this.validators.size} votes`,
      JSON.stringify({ votes })
    ]);
    
    return consensusReached;
  }

  async recordBlockProduced(address: string) {
    await db.query(`
      UPDATE validators
      SET blocks_produced = blocks_produced + 1,
          last_block_time = $1
      WHERE address = $2
    `, [Date.now(), address]);
  }

  getValidator(address: string): BaseValidator | undefined {
    return this.validators.get(address);
  }

  getAllValidators(): BaseValidator[] {
    return Array.from(this.validators.values());
  }
}
