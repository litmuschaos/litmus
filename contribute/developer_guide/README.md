## Steps to Bootstrap a Chaos Experiment

The artefacts associated with a chaos-experiment are summarized below: 

- Submitted in the litmuschaos/litmus repository, under the experiments/*chaos-category* folder i.e, `experiments/generic`

  - Experiment business logic (either as Ansible Playbook, Golang, Python or Bash script, or other). May involve creating new or reusing an existing chaoslib (e.g. pumba, chaostoolkit).
  - Experiment Kubernetes job (passes the experiment-specific chaos parameters, executes the business logic)

  Example: [pod delete experiment in litmus](/experiments/generic/pod_delete)

- Submitted in litmuschaos/chaos-charts repository, under the *chaos-category* folder i.e, `generic`

  - Experiment custom resource (CR) (holds experiment-specific chaos parameters & playbook entrypoint)
  - Experiment ChartServiceVersion (holds experiment metadata that will be rendered on [charthub](hub.litmuschaos.io))
  - Experiment RBAC ( holds experiment-specific ServiceAccount, Role and RoleBinding)
  - Experiment Engine ( holds experiment-specific chaosengine)

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

  As an example, let us consider an experiment to kill one of the replicas of a nginx deployment. The attributes.yaml can be constructed like this: 
  
  ```yaml
  $ cat attributes.yaml 
  
  ---
  name: pod-delete
  version: 0.1.0
  category: sample-category
  repository: https://github.com/litmuschaos/litmus/tree/master/experiments/sample-category/pod-delete
  community: https://kubernetes.slack.com/messages/CNXNB0ZTN
  description: "kills nginx pods in a random manner"
  keywords:
    - pods
    - kubernetes
    - sample-category
    - nginx
  scope: "Namespaced"
  permissions:
    - apiGroups:
        - ""
        - "batch"
        - "litmuschaos.io"
      resources:
        - "jobs"
        - "pods"
        - "chaosengines"
        - "chaosexperiments"
        - "chaosresults"
      verbs:
        - "create"
        - "list"
        - "get"
        - "update"
        - "patch"
        - "delete"
  maturity: alpha
  maintainers:
    - ksatchit@mayadata.io
  contributors:
    - ksatchit@mayadata.io
  provider:
    name: Mayadata
  min_kubernetes_version: 1.12.0
  references:
    - https://docs.litmuschaos.io/docs/getstarted/

  ```

- Run the following command to generate the necessary artefacts for submitting the `sample-category` chaos chart with 
  `pod-delete` experiment.

  ```
  $ python3 generate_chart.py --attributes_file=attributes.yaml --generate_type=experiment
  ```

  **Note**: In the `--generate_type` attribute, select the appropriate type of manifests to be generated, where, 
  - `chart`: Just the chaos-chart metadata, i.e., chartserviceversion yaml 
  - `experiment`: Chaos experiment artefacts belonging to a an existing OR new chart. 

  View the generated files in `/experiments/chaos-category` folder.

  ```
  $ cd /experiments

  $ ls -ltr

  total 28
  drwxr-xr-x 2 ksatchit ksatchit 4096 Oct 17 12:54 mysql
  drwxr-xr-x 6 ksatchit ksatchit 4096 Oct 21 09:28 generic
  drwxr-xr-x 6 ksatchit ksatchit 4096 Oct 21 09:28 openebs
  drwxr-xr-x 6 ksatchit ksatchit 4096 Oct 21 09:28 kafka
  drwxr-xr-x 6 ksatchit ksatchit 4096 Oct 21 09:28 coredns
  drwxr-xr-x 6 ksatchit ksatchit 4096 Oct 21 09:28 chaostoolkit
  drwxr-xr-x 3 ksatchit ksatchit 4096 Oct 21 10:54 sample-category

  $ ls -ltr sample-category/

  total 12
  -rw-r--r-- 1 ksatchit ksatchit  704 Oct 21 10:54 sample-category.package.yaml
  -rw-r--r-- 1 ksatchit ksatchit  704 Oct 21 10:54 sample-category.chartserviceversion.yaml
  drwxr-xr-x 2 ksatchit ksatchit 4096 Oct 21 10:54 pod-delete

  $ ls -ltr sample-category/pod-delete

  total 32
  -rw-r--r-- 1 ksatchit ksatchit  704 Oct 21 10:54 pod-delete.chartserviceversion.yaml
  -rw-r--r-- 1 ksatchit ksatchit 1405 Oct 21 10:54 rbac.yaml
  -rw-r--r-- 1 ksatchit ksatchit 1405 Oct 21 10:54 experiment.yaml
  -rw-r--r-- 1 ksatchit ksatchit 1405 Oct 21 10:54 engine.yaml
  -rw-r--r-- 1 ksatchit ksatchit 1405 Oct 21 10:54 pod-delete-k8s-job.yml
  -rw-r--r-- 1 ksatchit ksatchit   69 Oct 21 10:54 pod-delete-ansible-prerequisites.yml
  -rw-r--r-- 1 ksatchit ksatchit 2167 Oct 21 10:54 pod-delete-ansible-logic.yml
  
  ```
 
- Proceed with construction of business logic inside the `pod-delete-ansible-logic.yml` file, by making
  the appropriate modifications listed below to achieve the desired effect: 

  - variables 
  - entry & exit criteria checks for the experiment 
  - helper utils in either [utils](/utils/) or new [base chaos libraries](/chaoslib) 

- Update the `experiment.yaml` with the right chaos params in the `spec.definition.env` with their
  default values

- Create an experiment README (example: [pod delete readme](experiments/generic/pod_delete/README.md)) explaining, briefly, 
  the *what*, *why* & *how* of the experiment to aid users of this experiment. 

### Steps to Test Experiment 

The experiment created using the above steps, can be tested in the following manner: 

- Run the `pod-delete-k8s-job.yml` with the desired values in the ENV and appropriate `chaosServiceAccount` 
  using a custom dev image instead of `litmuschaos/ansible-runner` (say, ksatchit/ansible-runner) that packages the 
  business logic.

- (Optional) Once the experiment has been validated using the above step, it can also be tested against the standard chaos 
  workflow using the `experiment.yaml`. This involves: 

  - Launching the Chaos-Operator
  - Creating the ChaosExperiment CR on the cluster (use the same custom dev image used in the above step) 
  - Creating the ChaosEngine to execute the above ChaosExperiment
  - Verifying the experiment status via ChaosResult 

  Refer [litmus docs](https://docs.litmuschaos.io/docs/getstarted/) for more details on this procedure.

### Steps to Include the Chaos Charts/Experiments into the ChartHub

- Send a PR to the [litmus](https://github.com/litmuschaos/litmus) repo with the modified litmusbook files
- Send a PR to the [chaos-charts](https://github.com/litmuschaos/chaos-charts) repo with the modified experiment CR, 
  experiment chartserviceversion, chaos chart (category-level) chartserviceversion & package (if applicable) YAMLs
