# Sock shop application metrics dashboard

This dashboard visualizes Sock Shop application metrics metrics interleaved with chaos events and chaos exporter metrics.

## Prerequisites

- Sock shop microservices application deployments with service monitors.

- Litmus event router and chaos exporter with service monitors.

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

## Screenshot

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Sock-Shop-Dashboard.png?raw=true)
