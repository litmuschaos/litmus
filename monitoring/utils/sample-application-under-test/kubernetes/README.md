### Setup Kube-state-metrics exporter

- To use with prometheus deployment with configured scrape job.

  ```
  kubectl -n monitoring apply -f utils/metrics-exporters/kube-state-metrics/
  ```

  OR

- To use with prometheus operator with service monitor selector.

  ```
  kubectl -n monitoring apply -f utils/metrics-exporters-with-service-monitors/kube-state-metrics/
  ```
