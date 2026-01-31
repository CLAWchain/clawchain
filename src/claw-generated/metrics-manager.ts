import { 
  blocksCreated,
  blockTime,
  blockSize,
  transactionsProcessed,
  transactionPoolSize,
  transactionGasUsage,
  connectedPeers,
  peerChurn,
  messageLantency,
  cpuUsage,
  memoryUsage,
  diskUsage
} from './metrics';

class MetricsManager {
  constructor() {
    // Initialize metrics
    blocksCreated.inc(0);
    blockTime.set(0);
    blockSize.set(0);
    transactionsProcessed.inc(0);
    transactionPoolSize.set(0);
    transactionGasUsage.set(0);
    connectedPeers.set(0);
    peerChurn.inc(0);
    messageLantency.set(0);
    cpuUsage.set(0);
    memoryUsage.set(0);
    diskUsage.set(0);
  }

  updateBlockMetrics(blockCount: number, blockTimeSeconds: number, blockSizeBytes: number) {
    blocksCreated.inc(blockCount);
    blockTime.set(blockTimeSeconds);
    blockSize.set(blockSizeBytes);
  }

  updateTransactionMetrics(txProcessed: number, poolSize: number, gasUsed: number) {
    transactionsProcessed.inc(txProcessed);
    transactionPoolSize.set(poolSize);
    transactionGasUsage.set(gasUsed);
  }

  updatePeerMetrics(connectedPeersCount: number, peerChurnCount: number, messageLatencyMs: number) {
    connectedPeers.set(connectedPeersCount);
    peerChurn.inc(peerChurnCount);
    messageLantency.set(messageLatencyMs);
  }

  updateResourceMetrics(cpuUsagePercent: number, memoryUsageBytes: number, diskUsagePercent: number) {
    cpuUsage.set(cpuUsagePercent);
    memoryUsage.set(memoryUsageBytes);
    diskUsage.set(diskUsagePercent);
  }
}

export default MetricsManager;