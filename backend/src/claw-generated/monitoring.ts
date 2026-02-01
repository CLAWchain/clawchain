/**
 * ClawChain Monitoring and Metrics
 * This module collects and persists key network-level metrics
 * for use in the Grafana dashboard.
 */

import { eventBus } from '../events/EventBus';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const METRICS_FILE = path.join(DATA_DIR, 'chain_metrics.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ChainMetrics {
  blockHeight: number;
  transactionCount: number;
  consensusParticipation: number;
  averageBlockTime: number;
  nodeCount: number;
  cpuUtilization: number;
  memoryUsage: number;
  diskUsage: number;
  networkBandwidth: number;
  timestamp: Date;
}

let currentMetrics: ChainMetrics = {
  blockHeight: 0,
  transactionCount: 0,
  consensusParticipation: 0,
  averageBlockTime: 0,
  nodeCount: 0,
  cpuUtilization: 0,
  memoryUsage: 0,
  diskUsage: 0,
  networkBandwidth: 0,
  timestamp: new Date(),
};

// Load persisted metrics from disk
function loadPersistedMetrics(): ChainMetrics[] {
  try {
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf-8');
      const metrics = JSON.parse(data);
      return metrics.map((m: ChainMetrics & { timestamp: string }) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (e) {
    console.error('[Monitoring] Failed to load persisted metrics:', e);
  }
  return [];
}

// Save metrics to disk
function persistMetrics(): void {
  try {
    fs.writeFileSync(METRICS_FILE, JSON.stringify([currentMetrics], null, 2));
  } catch (e) {
    console.error('[Monitoring] Failed to persist metrics:', e);
  }
}

// Update metrics based on events
function updateMetrics(event: any): void {
  switch (event.type) {
    case 'block.added':
      currentMetrics.blockHeight = event.blockHeight;
      currentMetrics.transactionCount = event.transactionCount;
      currentMetrics.consensusParticipation = event.consensusParticipation;
      currentMetrics.averageBlockTime = event.averageBlockTime;
      break;
    case 'node.joined':
      currentMetrics.nodeCount++;
      break;
    case 'node.left':
      currentMetrics.nodeCount--;
      break;
    case 'resource.utilization':
      currentMetrics.cpuUtilization = event.cpuUtilization;
      currentMetrics.memoryUsage = event.memoryUsage;
      currentMetrics.diskUsage = event.diskUsage;
      currentMetrics.networkBandwidth = event.networkBandwidth;
      break;
  }
  currentMetrics.timestamp = new Date();
  persistMetrics();
}

// Subscribe to relevant events
eventBus.on('block.added', updateMetrics);
eventBus.on('node.joined', updateMetrics);
eventBus.on('node.left', updateMetrics);
eventBus.on('resource.utilization', updateMetrics);

// Load initial metrics
const persistedMetrics = loadPersistedMetrics();
if (persistedMetrics.length > 0) {
  currentMetrics = persistedMetrics[persistedMetrics.length - 1];
}