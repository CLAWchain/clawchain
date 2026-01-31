import { GrafanaAPI } from './GrafanaAPI';

export class GrafanaDashboard {
  private api: GrafanaAPI;

  constructor() {
    this.api = new GrafanaAPI();
  }

  async create() {
    const dashboard = {
      annotations: {
        list: [
          {
            builtIn: 1,
            datasource: '-- Grafana --',
            enable: true,
            hide: true,
            iconColor: 'rgba(0, 211, 255, 1)',
            name: 'Annotations & Alerts',
            type: 'dashboard'
          }
        ]
      },
      editable: true,
      gnetId: null,
      graphTooltip: 0,
      id: null,
      links: [],
      panels: [
        {
          datasource: null,
          fieldConfig: {
            defaults: {
              color: {
                mode: 'palette-classic'
              },
              custom: {
                axisLabel: '',
                axisPlacement: 'auto',
                barAlignment: 0,
                drawStyle: 'line',
                fillOpacity: 10,
                gradientMode: 'none',
                hideFrom: {
                  legend: false,
                  tooltip: false,
                  viz: false
                },
                lineInterpolation: 'linear',
                lineWidth: 1,
                pointSize: 5,
                scaleDistribution: {
                  type: 'linear'
                },
                showPoints: 'auto',
                spanNulls: false,
                stacking: {
                  group: 'A',
                  mode: 'none'
                },
                thresholdsStyle: {
                  mode: 'off'
                }
              },
              mappings: [],
              thresholds: {
                mode: 'absolute',
                steps: [
                  {
                    color: 'green',
                    value: null
                  },
                  {
                    color: 'red',
                    value: 80
                  }
                ]
              }
            },
            overrides: []
          },
          gridPos: {
            h: 8,
            w: 12,
            x: 0,
            y: 0
          },
          id: 1,
          options: {
            calculateFrom: '',
            calculation: {
              reduce: {
                aggregate: 'max',
                label: 'Maximum'
              }
            },
            legend: {
              displayMode: 'list',
              placement: 'bottom',
              showLegend: true
            },
            tooltip: {
              mode: 'single'
            },
            transformations: []
          },
          pluginVersion: '8.5.6',
          targets: [
            {
              refId: 'A',
              scenarioId: 'random_walk'
            }
          ],
          title: 'Block Production',
          type: 'timeseries'
        }
      ],
      schemaVersion: 34,
      style: 'dark',
      tags: [],
      templating: {
        list: []
      },
      time: {
        from: 'now-6h',
        to: 'now'
      },
      timepicker: {
        refresh_intervals: [
          '5s',
          '10s',
          '30s',
          '1m',
          '5m',
          '15m',
          '30m',
          '1h',
          '2h',
          '1d'
        ]
      },
      timezone: '',
      title: 'ClawChain Network Dashboard',
      uid: null,
      version: 0
    };

    await this.api.createDashboard(dashboard);
  }

  async update() {
    // Update existing dashboard
  }

  async delete() {
    // Delete the dashboard
  }
}