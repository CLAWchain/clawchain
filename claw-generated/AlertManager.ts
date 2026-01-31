import { EventBus } from '../events/EventBus';

class AlertManager {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  start() {
    // Listen for metrics and trigger alerts
    this.eventBus.on('metrics.blockHeight', (blockHeight) => {
      this.checkBlockHeight(blockHeight);
    });

    this.eventBus.on('metrics.transactionVolume', (transactionCount) => {
      this.checkTransactionVolume(transactionCount);
    });

    this.eventBus.on('metrics.validatorStatus', (validatorStatus) => {
      this.checkValidatorStatus(validatorStatus);
    });

    this.eventBus.on('metrics.consensusStatus', (consensusStatus) => {
      this.checkConsensusStatus(consensusStatus);
    });
  }

  private checkBlockHeight(blockHeight: number) {
    if (blockHeight < 100) {
      this.triggerAlert('Low block height', `Current block height: ${blockHeight}`);
    }
  }

  private checkTransactionVolume(transactionCount: number) {
    if (transactionCount < 10) {
      this.triggerAlert('Low transaction volume', `Current transaction count: ${transactionCount}`);
    }
  }

  private checkValidatorStatus(validatorStatus: { address: string; status: string; missedBlocks: number }) {
    if (validatorStatus.status === 'offline' || validatorStatus.missedBlocks > 10) {
      this.triggerAlert('Validator issue', `Validator ${validatorStatus.address} is ${validatorStatus.status} and has missed ${validatorStatus.missedBlocks} blocks`);
    }
  }

  private checkConsensusStatus(consensusStatus: { healthy: boolean; message?: string }) {
    if (!consensusStatus.healthy) {
      this.triggerAlert('Consensus issue', consensusStatus.message || 'Consensus is degraded');
    }
  }

  private triggerAlert(title: string, message: string) {
    console.log(`[ALERT] ${title}: ${message}`);
    this.eventBus.emit('alert', { title, message });
  }
}

export { AlertManager };