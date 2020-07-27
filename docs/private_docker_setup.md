## Steps to push images to GCR & procedure to use these

#### STEP-1: RETAG AND PUSH LITMUSCHAOS IMAGES TO RESPECTIVE GCR

###### Pull the following images:

```
litmuschaos/ansible-runner:ci
litmuschaos/chaos-operator:ci
litmuschaos/chaos-exporter:ci
gaiaadm/pumba:0.4.8
```
###### Re-tag the images:

```
docker tag litmuschaos/ansible-runner:ci gcr.io/<project-id>/ansible-runner:ci
docker tag litmuschaos/chaos-operator:latest gcr.io/<project-id>/chaos-operator:ci
docker tag litmuschaos/chaos-exporter:ci gcr.io/<project-id>/chaos-exporter:ci
docker tag gaiaadm/pumba:0.4.8 gcr.io/<project-id>/pumba:0.4.8
```

#### STEP-2: PUSH THE RETAGGED IMAGES TO GCR

Ensure sufficient privileges on the gcloud iam/user/serviceaccount

```
gcloud docker -- push gcr.io/<project-id>/ansible-runner:ci
gcloud docker -- push gcr.io/<project-id>/chaos-operator:ci
gcloud docker -- push gcr.io/<project-id>/chaos-exporter:ci
gcloud docker -- push gcr.io/<project-id>/pumba:0.4.8
```

#### STEP-3: DOWNLOAD, MODIFY AND APPLY LITMUS OPERATOR YAML

Download the latest version of the litmus operator (install) yaml

`wget https://litmuschaos.github.io/litmus/litmus-operator-ci.yaml`

Modify the chaos-operator image from

`litmuschaos/chaos-operator:ci` to `gcr.io/<project-id>/chaos-operator:latest`

Modify the namespace of the operator deployment as well as the RBAC components as desired.

Install the litmus operator and other dependencies

`kubectl apply -f litmus-operator-ci.yaml`

#### STEP-4: PULL EXPERIMENTS FROM HUB INTO THE DESIRED APP NAMESPACE

Browse the hub to pull the latest experiment charts

`kubectl create -f https://hub.litmuschaos.io/api/chaos?file=charts/generic/experiments.yaml`

#### STEP-5: UPDATE THE IMAGE OF THE EXPERIMENT RUNNER

Update the value of spec.definition.image in the experiments to the new ansible-runner image

`gcr.io/<project-id>/ansible-runner:ci`

`kubectl edit chaosexperiment <experiment-name> -n <namespace>`

#### STEP-6: CREATE THE CHAOSENGINE WITH NEW EXECUTOR, MONITOR & LIB IMAGES (if applicable)

Apart from the right namespace, label & container-names etc., (corresponding to your test app), provide spec.components.monitor.image & spec.components.runner.image with appropriate values (newly pushed GCR).
Also provide the appropriate lib image if applicable (in case of: container kill, network loss/latency experiments)

Example chaosengine for container kill is shown below:

```
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: chaos
  namespace: default
spec:
  monitoring: true
  jobCleanUpPolicy: "false"
  appinfo:
    appkind: deployment
    applabel: app=hello
    appns: default
  chaosServiceAccount: nginx
  components:
    monitor:
      image: "gcr.io/<project-id>/chaos-exporter:ci"
    runner:
      image: "gcr.io/<project-id>/ansible-runner:ci"
  experiments:
  - name: container-kill
    spec:
      components:
      - name: TARGET_CONTAINER
        value: "flux-test"
      - name: LIB
        value: "pumba"
      - name: LIB_IMAGE
        value: "gcr.io/<project-id>/pumba:0.4.8"
```

#### STEP-7: CREATE THE CHAOSENGINE AND WATCH EXPERIMENT EXECUTION

Run the experiment and watch pod/resource status & chaosresult verdict

`kubectl apply -f chaosengine.yaml -n <namespace>`

`watch -n 1 kubectl get pods --all-namespaces`

`kubectl get chaosresult <engine-name>-<experiment-name> -n <namespace> -o yaml`
