## Steps to Bootstrap a Chaos Experiment

The artefacts associated with a chaos-experiment are summarized below: 

- Submitted in the litmuschaos/litmus repository, under the experiments/*chaos category* folder

  - Experiment business logic (either as ansible playbook, or other). May involve creation of new or reuse of existing chaoslib
  - Experiment Kubernetes job (executes the business logic, also called litmusbook)

  Example: [pod delete experiment in litmus](/experiments/generic/pod_delete)

- Submitted in litmuschaos/chaos-charts repository, under the *chaos category* folder

  - Experiment custom resource (CR) (holds experiment-specific chaos parameters & playbook entrypoint)
  - Experiment ChartServiceVersion (holds experiment metadata that will be rendered on [charthub](hub.litmuschaos.io))

  Example: [pod delete experiment in chaos-charts](https://github.com/litmuschaos/chaos-charts/tree/master/charts/generic/pod-delete)

The *generate_charts.py* script is a simple way to bootstrap your experiment, and helps create the aforementioned artefacts in the 
appropriate directory (i.e., as per the chaos-category) based on an attributes file provided as input by the chart-developer. The 
scaffolded files consist of placeholders which can then be filled as desired.  

### Pre-Requisites

- *python3* is available (`sudo apt-get install python3.6`) 
- *jinja2* & *pyYaml* python packages are available (`sudo apt-get install python3-pip`, `pip install jinja2`, `pip install pyYaml`) 

### Steps to Generate Experiment Manifests

- Clone the litmus repository & navigate to the `contribute/developer_guide` folder

  ```
  $ git clone https://github.com/litmuschaos/litmus.git
  $ cd litmus/contribute/developer_guide
  ```

- Populate the `attributes.yaml` with details of the chaos experiment (or chart). Use the [attributes.yaml.sample](/contribute/developer_guide/attributes.yaml.sample) as reference. 

  As an example, let us consider an experiment to kill one of the replicas of a nodejs-app that provides a simple 
  hello-world service. The attributes.yaml can be constructed like this: 

  ```
  $ cat attributes.yaml 
  
  ---
  name: kill-hello-replicas
  version: 0.1.0
  category: hello-world
  repository: https://github.com/litmuschaos/demo-app/tree/master/sample_apps/hellonode
  community: https://kubernetes.slack.com/messages/CNXNB0ZTN
  description: "kills hello-world pods in a random manner"
  keywords: 
    - pods
    - kubernetes
    - hello-world
    - nodejs
  maturity: alpha
  maintainers: 
    - ksatchit@mayadata.io
  contributors: 
    - ksatchit@mayadata.io
  min_kubernetes_version: 1.12.0
  references: 
    - https://docs.litmuschaos.io/docs/getstarted/
  ```

- Run the following command to generate the necessary artefacts for submitting the `hello-world` chaos chart with 
  `kill-hello-replicas` experiment.

  ```
  $ python3 generate_chart.py --attributes_file=attributes.yaml --generate_type=experiment
  ```
  View the generated files

  ```
  $ ls -ltr

  total 12
  drwxr-xr-x 2 ksatchit ksatchit 4096 Oct 17 12:54 mysql
  drwxr-xr-x 6 ksatchit ksatchit 4096 Oct 21 09:28 generic
  drwxr-xr-x 3 ksatchit ksatchit 4096 Oct 21 10:54 hello-world

  $ ls -ltr hello-world/

  total 8
  -rw-r--r-- 1 ksatchit ksatchit  704 Oct 21 10:54 hello-world.chartserviceversion.yaml
  drwxr-xr-x 2 ksatchit ksatchit 4096 Oct 21 10:54 kill-hello-replicas

  $ ls -ltr hello-world/kill-hello-replicas

  total 20
  -rw-r--r-- 1 ksatchit ksatchit  704 Oct 21 10:54 kill-hello-replicas.chartserviceversion.yaml
  -rw-r--r-- 1 ksatchit ksatchit 1405 Oct 21 10:54 kill-hello-replicas-k8s-job.yml
  -rw-r--r-- 1 ksatchit ksatchit  590 Oct 21 10:54 kill-hello-replicas-experiment-cr.yml
  -rw-r--r-- 1 ksatchit ksatchit   69 Oct 21 10:54 kill-hello-replicas-ansible-prerequisites.yml
  -rw-r--r-- 1 ksatchit ksatchit 2167 Oct 21 10:54 kill-hello-replicas-ansible-logic.yml
  
  ```
 
  **Note**: In the `--generate_type` attribute, select the appropriate type of manifests to be generated, where, 
  - `chart`: Just the chaos-chart metadata, i.e., chartserviceversion yaml 
  - `experiment`: Chaos experiment artefacts belonging to a an existing OR new chart. 

- Proceed with construction of business logic inside the `kill-hello-replicas-ansible-logic.yml` file, by making
  the appropriate modifications listed below to achieve the desired effect: 

  - variables 
  - entry & exit criteria checks for the experiment 
  - helper utils in either [utils](/utils/) or new [base chaos libraries](/chaoslib) 

- Update the `kill-hello-replicas-experiment-cr.yml` with the right chaos params in the `spec.definition.env` with their
  default values

- Create an experiment README (example: [pod delete readme](experiments/generic/pod_delete/README.md)) explaining, briefly, 
  the *what*, *why* & *how* of the experiment to aid users of this experiment. 

### Steps to Test Experiment 

The experiment created using the above steps, can be tested in the following manner: 

- Run the `kill-hello-replicas-k8s-job.yml` with the desired values in the ENV and appropriate `chaosServiceAccount` 
  using a custom dev image instead of `litmuschaos/ansible-runner` (say, ksatchit/ansible-runner) that packages the 
  business logic.

- (Optional) Once the experiment has been validated using the above step, it can also be tested against the standard chaos 
  workflow using the `kill-hello-replicas-experiment-cr.yml`. This involves: 

  - Launching the Chaos-Operator
  - Creating the ChaosExperiment CR on the cluster (use the same custom dev image used in the above step) 
  - Creating the ChaosEngine to execute the above ChaosExperiment
  - Verifying the experiment status via ChaosResult 

  Refer [litmus docs](https://docs.litmuschaos.io/docs/getstarted/) for more details on this procedure.

### Steps to Include the Chaos Charts/Experiments into the ChartHub

- Send a PR to the [litmus](https://github.com/litmuschaos/litmus) repo with the modified litmusbook files
- Send a PR to the [chaos-charts](https://github.com/litmuschaos/chaos-charts) repo with the modified experiment CR, 
  experiment chartserviceversion, chaos chart (category-level) chartserviceversion & package (if applicable) YAMLs