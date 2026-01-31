import { EventBus } from '../events/EventBus';

class GrafanaDashboard {
  private eventBus: EventBus;
  private grafanaAPI: GrafanaAPI;

  constructor(eventBus: EventBus, grafanaAPI: GrafanaAPI) {
    this.eventBus = eventBus;
    this.grafanaAPI = grafanaAPI;
  }

  create() {
    this.eventBus.on('metrics.blockHeight', (blockHeight) => {
      this.updateBlockHeightChart(blockHeight);
    });

    this.eventBus.on('metrics.transactionVolume', (transactionCount) => {
      this.updateTransactionVolumeChart(transactionCount);
    });

    this.eventBus.on('metrics.validatorStatus', (validatorStatus) => {
      this.updateValidatorStatusChart(validatorStatus);
    });

    this.eventBus.on('metrics.consensusStatus', (consensusStatus) => {
      this.updateConsensusStatusChart(consensusStatus);
    });

    this.eventBus.on('alert', (alert) => {
      this.addAlertNotification(alert);
    });
  }

  private updateBlockHeightChart(blockHeight: number) {
    this.grafanaAPI.updateChart('block-height', blockHeight);
  }

  private updateTransactionVolumeChart(transactionCount: number) {
    this.grafanaAPI.updateChart('transaction-volume', transactionCount);
  }

  private updateValidatorStatusChart(validatorStatus: { address: string; status: string; missedBlocks: number }) {
    this.grafanaAPI.updateChart('validator-status', validatorStatus);
  }

  private updateConsensusStatusChart(consensusStatus: { healthy: boolean; message?: string }) {
    this.grafanaAPI.updateChart('consensus-status', consensusStatus);
  }

  private addAlertNotification(alert: { title: string; message: string }) {
    this.grafanaAPI.addAlert(alert);
  }
}

interface GrafanaAPI {
  updateChart(chartId: string, data: any): void;
  addAlert(alert: { title: string; message: string }): void;
}

export { GrafanaDashboard };