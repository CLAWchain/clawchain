import { Chain } from '../blockchain/Chain';
import { PrometheusClient } from '../monitoring/PrometheusClient';

export class ChainWithMetrics extends Chain {
  private prometheus: PrometheusClient;

  constructor() {
    super();
    this.prometheus = new PrometheusClient();
  }

  async addBlock(block: Block): Promise<boolean> {
    const result = await super.addBlock(block);

    // Update Prometheus metrics
    this.prometheus.incrementBlocksTotal();
    this.prometheus.incrementTransactionsTotal(block.transactions.length);

    return result;
  }

  getLatestBlock(): Block | undefined {
    const block = super.getLatestBlock();
    if (block) {
      this.prometheus.setBlockHeight(block.header.height);
      this.prometheus.setBlockTimestamp(block.header.timestamp);
    }
    return block;
  }
}