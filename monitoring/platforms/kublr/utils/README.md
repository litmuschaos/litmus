# Utilities

This directory contains utilities required to configure Kublr's monitoring infrastructure for application or generic metrics with chaos exporter metrics and litmus event router updates.

## Setups

- [Metrics exporters](https://github.com/litmuschaos/litmus/blob/master/monitoring/platforms/kublr/utils/metrics-exporters)

  > Contains setup for different metrics exporters.

- [Sample application under test](https://github.com/litmuschaos/litmus/blob/master/monitoring/platforms/kublr/utils/sample-application-under-test)

  > Contains sample AUT manifests.

- [Sample chaos injectors](https://github.com/litmuschaos/litmus/blob/master/monitoring/platforms/kublr/utils/sample-chaos-injectors)

  > Contains chaos experiments and chaos workflows as sample chaos injectors.

- [Prometheus config template jobs](https://github.com/litmuschaos/litmus/blob/master/monitoring/platforms/kublr/utils/prometheus-config-template-jobs.yaml)

  > Contains scrape jobs for scraping litmuschaos and sock-shop application metrics.
