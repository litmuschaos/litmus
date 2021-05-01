# Sock shop application metrics dashboard

This dashboard visualizes Sock Shop application metrics metrics interleaved with chaos events and chaos exporter metrics.

## Prerequisites

- Sock shop microservices application deployments with service monitors.

- Litmus chaos exporter with service monitors.

- Prometheus operator and deployment configured for using the service monitors.

OR

- Sock shop microservices application deployments.

- prometheus deployment with a scrape job for litmus and sock-shop application metrics.

- Chaos engine name must match the labels used in PromQL for the grafana dashboard.

## Instructions

- Download the dashboard json file.

- Import the json file into grafana.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/import-dashboard.png?raw=true)

- Change data source for the dashboard accordingly.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/data-source-config.png?raw=true)

- Tune the PromQL queries to match the labels with engine name and other parameters as per need.

## Screenshots

### Chaos Result selector dropdown:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/chaos-result-selector.png?raw=true)

### Chaos Engine Context (Target application's NAMESPACE_LABEL) selector dropdown:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/chaos-engine-context-selector.png?raw=true)

### Chaos Engines with Experiments as Chaos Results:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/chaos-experiments.png?raw=true)

### Chaos event annotations:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/chaos-event-annotation.png?raw=true)

### Chaos Result verdict annotations:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/chaos-result-verdict-annotation.png?raw=true)

### Interleaved Chaos events:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/interleaved-events.png?raw=true)

### Interleaved Chaos Result verdicts:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/interleaved-results.png?raw=true)

### Chaos Result verdict failure alerts:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/verdict-failure-alert.png?raw=true)

### Chaos Result probe failure alerts:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/probe-failure-alert.png?raw=true)

### Systems healthy / in steady state OR no alerts to be issued:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/no-alerts-issued.png?raw=true)

### Systems un-healthy / failed to regain steady state after chaos / meet SLO OR alerts are issued:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/alerts-active.png?raw=true)

### Alerts issued:

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/sock-shop/alerts-sent.png?raw=true)
