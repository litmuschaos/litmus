# Node and Pod K8s metrics dashboard

These dashboards visualize Percona SQL server and PMM server metrics interleaved with chaos events.

## Prerequisites

- mysqld exporter with service monitor and Prometheus operator and deployment configured for using the service monitor.

- mysqld exporter with Prometheus deployment with job configured for scraping metrics from the service endpoint.

OR

- Percona PMM installation.

- Chaos engine name must match the labels used in PromQL for the grafana dashboard.

## Instructions

- Download the dashboard json file.

- Import the json file into grafana.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/import-dashboard.png?raw=true)

- Change data source for the dashboard accordingly.

  ![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/data-source-config.png?raw=true)

- Tune the PromQL queries to match the labels with engine name and other parameters as per need.

## Screenshots

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/mySQL-Overview-1.png?raw=true)

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/mySQL-Overview-2.png?raw=true)

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Galera-Node-Summary-1.png?raw=true)

![image](https://github.com/litmuschaos/litmus/blob/master/monitoring/screenshots/Galera-Node-Summary-2.png?raw=true)
