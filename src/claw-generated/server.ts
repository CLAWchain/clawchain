import express from 'express';
import { promBundle } from 'express-prom-bundle';
import MetricsManager from './metrics-manager';

const app = express();

// Prometheus middleware
app.use(
  promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    metricsPath: '/metrics',
  })
);

// Initialize metrics manager
const metricsManager = new MetricsManager();

// Example routes
app.get('/blocks', (req, res) => {
  const blockCount = 10;
  const blockTimeSeconds = 5.2;
  const blockSizeBytes = 1024;

  metricsManager.updateBlockMetrics(blockCount, blockTimeSeconds, blockSizeBytes);
  res.send(`Produced ${blockCount} blocks.`);
});

app.get('/transactions', (req, res) {
  const txProcessed = 100;
  const poolSize = 50;
  const gasUsed = 1000000;

  metricsManager.updateTransactionMetrics(txProcessed, poolSize, gasUsed);
  res.send(`Processed ${txProcessed} transactions.`);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});