# Get Started With Boutique Application Chaos

## Introduction
Online Boutique is a cloud-first microservices demo application. Online Boutique consists of an 11-tier microservices application. The application is a web-based e-commerce app where users can browse items, add them to the cart, and purchase them.

In this demo, we will perform the following actions using litmus chaos scenarios:
- Launch a [fortio load generator](https://github.com/litmuschaos/test-tools/blob/master/io_tools/fortio/fortio.yaml) on the frontend service of boutique application.
- In cpu-hog chaos experiment
- Run the cpu chaos on the frontend service under fortio load.
- Remove the forio job as part of the cleanup stage.

## Demo Recording

**UseCase:** This demo will help us to understand how we can run a load-gen on our application and perform a chaos test on it. To achieve this, the chaos scenario first launches a Forio load job on the frontend service of boutique application, then runs a cpu-chaos experiment on the same service to check the resiliency under load.

**Steps:**

1. Introduce demo setup: A sample application with monitoring setup and chaos center dashboard [0:00](https://www.youtube.com/watch?v=100brq0P6cI&t=0s) - [0:45](https://www.youtube.com/watch?v=100brq0P6cI&t=45s)
2. Select the pre-defined scenario and go through the individual steps  [0:45](https://www.youtube.com/watch?v=100brq0P6cI&t=45s) - [2:20](https://www.youtube.com/watch?v=100brq0P6cI&t=140s)
3. Run the scenario and visualise the impact of the load generator in grafana [2:21](https://www.youtube.com/watch?v=100brq0P6cI&t=141s) - [4:08](https://www.youtube.com/watch?v=100brq0P6cI&t=248s)
4. Visualise the impact of chaos on frontend service under load [4:09](https://www.youtube.com/watch?v=100brq0P6cI&t=249s) - [6:08](https://www.youtube.com/watch?v=100brq0P6cI&t=368s)
5. Check the chaos result and experiment logs for steady state validation [6:09](https://www.youtube.com/watch?v=100brq0P6cI&t=369s) - [7:10](https://www.youtube.com/watch?v=100brq0P6cI&t=430s)
