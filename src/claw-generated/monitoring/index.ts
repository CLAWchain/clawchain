import { GrafanaClient } from './grafana';
import { MetricsCollector } from './metrics';

export class MonitoringService {
  private grafana: GrafanaClient;
  private metrics: MetricsCollector;

  constructor() {
    this.grafana = new GrafanaClient();
    this.metrics = new MetricsCollector();
  }

  async start() {
    await this.grafana.connect();
    await this.metrics.startCollecting();
    this.grafana.createDashboard();
  }
}