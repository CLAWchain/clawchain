import { Chain } from '../blockchain/Chain';
import { Consensus } from '../blockchain/Consensus';
import { ValidatorManager } from '../validators/ValidatorManager';
import { EventBus } from '../events/EventBus';

class ChainMonitor {
  private chain: Chain;
  private consensus: Consensus;
  private validatorManager: ValidatorManager;
  private eventBus: EventBus;

  constructor(chain: Chain, consensus: Consensus, validatorManager: ValidatorManager, eventBus: EventBus) {
    this.chain = chain;
    this.consensus = consensus;
    this.validatorManager = validatorManager;
    this.eventBus = eventBus;
  }

  start() {
    // Monitor block production
    this.chain.on('newBlock', () => {
      this.reportBlockHeight();
      this.reportTransactionVolume();
    });

    // Monitor validator activity
    this.validatorManager.on('validatorStatusChange', (validator) => {
      this.reportValidatorStatus(validator);
    });

    // Monitor consensus status
    this.consensus.on('consensusStatusChange', (status) => {
      this.reportConsensusStatus(status);
    });
  }

  private reportBlockHeight() {
    const blockHeight = this.chain.getBlockHeight();
    this.eventBus.emit('metrics.blockHeight', blockHeight);
  }

  private reportTransactionVolume() {
    const transactionCount = this.chain.getTransactionCount();
    this.eventBus.emit('metrics.transactionVolume', transactionCount);
  }

  private reportValidatorStatus(validator: Validator) {
    this.eventBus.emit('metrics.validatorStatus', {
      address: validator.address,
      status: validator.status,
      missedBlocks: validator.missedBlocks,
    });
  }

  private reportConsensusStatus(status: ConsensusStatus) {
    this.eventBus.emit('metrics.consensusStatus', status);
  }
}

export { ChainMonitor };