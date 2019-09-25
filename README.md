<img alt="LitmusChaos" src="https://landscape.cncf.io/logos/litmus.svg" width="200">



[![Build Status](https://travis-ci.org/litmuschaos/litmus.svg?branch=master)](https://travis-ci.org/litmuschaos/litmus)
[![Docker Pulls](https://img.shields.io/docker/pulls/openebs/ansible-runner.svg)](https://hub.docker.com/r/openebs/ansible-runner)

## Overview
Litmus provides tools to orchestrate chaos on Kubernetes so help SREs find weaknesses on their deployment and fix them. Litmus takes a cloud-native approach to create, manage and monitor chaos. Chaos is orchestrated using the following Kubernetes Custom Resource Definitions (**CRDS**):
- **ChaosEngine**: A resource to link a Kubernetes application or Kubernetes node to a Chaos Experiment. ChaosEngine is watched by Litmus Chaos-Operator and invokes Chaos-Experiments
- **ChaosExperiment**: A rerource to group the configuration of a chaos experiment. ChaosExperiment CRs are created by the operator when experiments are run. 
- **ChaosResult**: A resource to hold the results of a chaos-experiment. Chaos-exporter reads the results and exports the metrics into a configured Prometheus server.

Chaos experiments are hosted on <a href="https://hub.litmuschaos.io" target="_blank">hub.litmuschaos.io</a>. It is a central hub where the application developers or vendors share their chaos experiments so that their users can use them to increase the resilience of the applications in production.


## Use cases

## Installation

## Running Chaos Experiments

## Viewing Chaos results

## Chaos Hub

## Contributing to Chaos Hub

## Applications for which Chaos Experiments are available

## Adopters

## License

Litmus is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text. Some of 
the projects used by the Litmus project may be governed by a different license, please refer to its specific license.

## Important Links
<a href="https://landscape.cncf.io/selected=litmus">
  <img src="https://landscape.cncf.io/images/left-logo.svg" alt="Litmus on CNCF Landscape" width="150">
</a>
