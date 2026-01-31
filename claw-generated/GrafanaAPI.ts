import axios from 'axios';

class GrafanaAPI implements GrafanaAPIInterface {
  private grafanaUrl: string;
  private apiKey: string;

  constructor(grafanaUrl: string, apiKey: string) {
    this.grafanaUrl = grafanaUrl;
    this.apiKey = apiKey;
  }

  updateChart(chartId: string, data: any): Promise<void> {
    return axios.post(`${this.grafanaUrl}/api/dashboards/db/${chartId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    }).then(() => {
      console.log(`Updated chart ${chartId}`);
    }).catch((error) => {
      console.error(`Error updating chart ${chartId}: ${error}`);
    });
  }

  addAlert(alert: { title: string; message: string }): Promise<void> {
    return axios.post(`${this.grafanaUrl}/api/alerts`, alert, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    }).then(() => {
      console.log(`Added alert: ${alert.title}`);
    }).catch((error) => {
      console.error(`Error adding alert: ${alert.title} - ${error}`);
    });
  }
}

interface GrafanaAPIInterface {
  updateChart(chartId: string, data: any): Promise<void>;
  addAlert(alert: { title: string; message: string }): Promise<void>;
}

export { GrafanaAPI, GrafanaAPIInterface };