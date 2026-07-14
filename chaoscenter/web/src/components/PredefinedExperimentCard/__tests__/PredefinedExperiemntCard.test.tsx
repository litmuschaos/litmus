import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import type { PredefinedExperiment } from '@api/entities';
import PredefinedExperimentCard from '..';

beforeAll(() =>
  window.history.pushState(
    {},
    'Chaos Fault',
    '/chaos-hubs/6f39cea9-6264-4951-83a8-29976b614289/fault/ecs-instance-stop?hubName=Enterprise%20ChaosHub&isDefault=true&chartName=aws'
  )
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    hubID: '6f39cea9-6264-4951-83a8-29976b614289'
  })
}));

const getPredefinedWorkflowResponse: PredefinedExperiment[] = [
  {
    experimentCSV:
      'apiVersion: litmuchaos.io/v1alpha1\nkind: ChartServiceVersion\nmetadata:\n  name: aws-ecs-instance-stop\n  version: 0.1.0\n  annotations:\n    categories: aws-ecs-instance-stop\n    chartDescription: Injects ec2 stop on the instance that runs a given task for a specified duration \nspec:\n  displayName: aws-ecs-instance-stop\n  categoryDescription: >\n    Injects ec2 stop on the instance that runs a given task for a specified duration\n  faults:\n    - name: ecs-instance-stop\n      description: Injects ec2 stop on the instance that runs a given task for a specified duration\n  keywords:\n    - AWS\n  platforms:\n    - GKE\n    - Minikube \n    - Packet(Kubeadm)\n    - EKS\n    - AKS\n  icon:\n    - url:\n      mediatype: ""\n',
    experimentManifest:
      'kind: Workflow\napiVersion: argoproj.io/v1alpha1\nmetadata:\n  name: ecs-instance-stop-1658150276\n  namespace: litmus\n  creationTimestamp: null\n  labels:\n    subject: ecs-instance-stop_litmus\nspec:\n  templates:\n    - name: custom-chaos\n      steps:\n        - - name: install-chaos-faults\n            template: install-chaos-faults\n        - - name: ecs-instance-stop-ol7\n            template: ecs-instance-stop-ol7\n        - - name: cleanup-chaos-resources\n            template: cleanup-chaos-resources\n    - name: install-chaos-faults\n      inputs:\n        artifacts:\n          - name: ecs-instance-stop-ol7\n            path: /tmp/ecs-instance-stop-ol7.yaml\n            raw:\n              data: >\n                apiVersion: litmuschaos.io/v1alpha1\n\n                description:\n                  message: |\n\n                kind: ChaosExperiment\n\n                metadata:\n                  name: ecs-instance-stop\n                  labels:\n                    name: ecs-instance-stop\n                    app.kubernetes.io/part-of: litmus\n                    app.kubernetes.io/component: chaosexperiment\n                    app.kubernetes.io/version: ci\n                spec:\n                  definition:\n                    scope: Namespaced\n                    permissions:\n                      - apiGroups:\n                          - ""\n                        resources:\n                          - pods\n                        verbs:\n                          - create\n                          - delete\n                          - get\n                          - list\n                          - patch\n                          - update\n                          - deletecollection\n                      - apiGroups:\n                          - ""\n                        resources:\n                          - events\n                        verbs:\n                          - create\n                          - get\n                          - list\n                          - patch\n                          - update\n                      - apiGroups:\n                          - ""\n                        resources:\n                          - configmaps\n                        verbs:\n                          - get\n                          - list\n                      - apiGroups:\n                          - ""\n                        resources:\n                          - pods/log\n                        verbs:\n                          - get\n                          - list\n                          - watch\n                      - apiGroups:\n                          - ""\n                        resources:\n                          - pods/exec\n                        verbs:\n                          - get\n                          - list\n                          - create\n                      - apiGroups:\n                          - apps\n                        resources:\n                          - deployments\n                          - statefulsets\n                          - replicasets\n                          - daemonsets\n                        verbs:\n                          - list\n                          - get\n                      - apiGroups:\n                          - apps.openshift.io\n                        resources:\n                          - deploymentconfigs\n                        verbs:\n                          - list\n                          - get\n                      - apiGroups:\n                          - ""\n                        resources:\n                          - replicationcontrollers\n                        verbs:\n                          - get\n                          - list\n                      - apiGroups:\n                          - argoproj.io\n                        resources:\n                          - rollouts\n                        verbs:\n                          - list\n                          - get\n                      - apiGroups:\n                          - batch\n                        resources:\n                          - jobs\n                        verbs:\n                          - create\n                          - list\n                          - get\n                          - delete\n                          - deletecollection\n                      - apiGroups:\n                          - litmuschaos.io\n                        resources:\n                          - chaosengines\n                          - chaosexperiments\n                          - chaosresults\n                        verbs:\n                          - create\n                          - list\n                          - get\n                          - patch\n                          - update\n                          - delete\n                    image: litmuschaos/go-runner:latest\n                    imagePullPolicy: Always\n                    args:\n                      - -c\n                      - ./experiments -name ecs-instance-stop\n                    command:\n                      - /bin/bash\n                    env:\n                      - name: TOTAL_CHAOS_DURATION\n                        value: "30"\n                      - name: RAMP_TIME\n                        value: ""\n                      - name: CHAOS_INTERVAL\n                        value: "10"\n                      - name: LIB\n                        value: litmus\n                      - name: MANAGED_NODEGROUP\n                        value: enable\n                      - name: AWS_SHARED_CREDENTIALS_FILE\n                        value: /tmp/cloud_config.yml\n                      - name: DEFAULT_HEALTH_CHECK\n                        value: \'false\'\n                    labels:\n                      name: ecs-instance-stop\n                      app.kubernetes.io/part-of: litmus\n                      app.kubernetes.io/component: experiment-job\n                      app.kubernetes.io/version: ci\n                    secrets:\n                      - name: cloud-secret\n                        mountPath: /tmp/\n      container:\n        name: ""\n        image: docker.io/chaosnative/k8s:2.13.0\n        command:\n          - sh\n          - -c\n        args:\n          - kubectl apply -f /tmp/ecs-instance-stop-ol7.yaml -n\n            {{workflow.parameters.adminModeNamespace}} && sleep 30\n    - name: ecs-instance-stop-ol7\n      inputs:\n        artifacts:\n          - name: ecs-instance-stop-ol7\n            path: /tmp/chaosengine-ecs-instance-stop-ol7.yaml\n            raw:\n              data: |\n                apiVersion: litmuschaos.io/v1alpha1\n                kind: ChaosEngine\n                metadata:\n                  namespace: "{{workflow.parameters.adminModeNamespace}}"\n                  generateName: ecs-instance-stop-ol7\n                  labels:\n                    instance_id: 422b11be-5be6-4a79-b431-734c6b05cc29\n                    context: ecs-instance-stop-ol7_litmus\n                    workflow_name: ecs-instance-stop-1658150276\n                spec:\n                  engineState: active\n                  chaosServiceAccount: litmus-admin\n                  experiments:\n                    - name: ecs-instance-stop\n                      spec:\n                        components:\n                          env:\n                            - name: TOTAL_CHAOS_DURATION\n                              value: "30"\n                            - name: CHAOS_INTERVAL\n                              value: "10"\n                            - name: CLUSTER_NAME\n                              value: ""\n                            - name: REGION\n                              value: ""\n                            - name: EC2_INSTANCE_ID\n                              value: ""\n                            - name: SEQUENCE\n                              value: parallel\n                        probe:\n                          - name: healthcheck\n                            type: cmdProbe\n                            mode: SOT\n                            runProperties:\n                              probeTimeout: 10\n                              retry: 0\n                              interval: 1\n                              stopOnFailure: true\n                            cmdProbe/inputs:\n                              command: ./healthcheck -name aws-ecs-instance-stop\n                              source:\n                                image: litmuschaos/go-runner:latest\n                                inheritInputs: true\n                              comparator:\n                                type: string\n                                criteria: contains\n                                value: "[P000]"\n                  annotationCheck: "false"\n      metadata:\n        labels:\n          weight: "10"\n      container:\n        name: ""\n        image: docker.io/chaosnative/litmus-checker:2.13.0\n        args:\n          - -file=/tmp/chaosengine-ecs-instance-stop-ol7.yaml\n          - -saveName=/tmp/engine-name\n    - name: cleanup-chaos-resources\n      container:\n        name: ""\n        image: litmuschaos/k8s:latest\n        command:\n          - sh\n          - -c\n        args:\n          - "kubectl delete chaosengine -l \'instance_id in\n            (422b11be-5be6-4a79-b431-734c6b05cc29, )\' -n\n            {{workflow.parameters.adminModeNamespace}} "\n  entrypoint: custom-chaos\n  arguments:\n    parameters:\n      - name: adminModeNamespace\n        value: litmus\n  serviceAccountName: argo-chaos\n  securityContext:\n    runAsUser: 1000\n    runAsNonRoot: true',
    experimentName: 'aws-ecs-instance-stop'
  }
];

describe('Predefined Experiment Card', () => {
  test('should have the correct card css properties', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <PredefinedExperimentCard predefinedExperiment={getPredefinedWorkflowResponse[0]} />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('bp3-card bp3-elevation-0 predefinedExperimentCard');
    expect(getByTestId('details').firstChild).toHaveClass(
      'StyledProps--font-variation-body StyledProps--font-weight-semi-bold StyledProps--color StyledProps--color-primary7'
    );
    expect(getByTestId('details').lastChild).toHaveClass('desc');
  });

  test('should have the correct experiment details', () => {
    const { container } = render(
      <TestWrapper>
        <PredefinedExperimentCard predefinedExperiment={getPredefinedWorkflowResponse[0]} />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveTextContent('aws-ecs-instance-stop');
    expect(container.firstChild).toHaveTextContent(
      'Injects ec2 stop on the instance that runs a given task for a specified duration'
    );
  });

  test('should navigate to Chaos Studio on launching experiment', async () => {
    Object.assign(location, { host: 'www.litmuschaos.io', pathname: 'chaos' });

    const { getByTestId } = render(
      <TestWrapper>
        <PredefinedExperimentCard predefinedExperiment={getPredefinedWorkflowResponse[0]} />
      </TestWrapper>
    );

    expect(getByTestId('launchBtn')).toHaveTextContent('playlaunchExperiment');
  });
});
