import { InfrastructureType } from '@api/entities';
import type { Experiment, ImageRegistry } from '@db';
import type { ExperimentManifest, KubernetesExperimentManifest } from '@models';

export default function blankCanvasTemplate(
  experiment: Experiment | undefined,
  infrastructureType: InfrastructureType
): ExperimentManifest {
  const experimentName = experiment?.name ?? 'chaos-experiment';

  switch (infrastructureType) {
    case InfrastructureType.KUBERNETES:
      return kubernetesBlankCanvasTemplate(experimentName, experiment?.chaosInfrastructure?.namespace);
  }
}

function kubernetesBlankCanvasTemplate(
  experimentName: string,
  chaosInfrastructureNamespace?: string,
  _serviceAccount?: string,
  imageRegistry: ImageRegistry = {
    repo: 'litmuschaos',
    secret: ''
  }
): KubernetesExperimentManifest {
  const imagePullSecrets = imageRegistry?.secret
    ? {
        imagePullSecrets: [{ name: imageRegistry.secret }]
      }
    : undefined;

  return {
    kind: 'Workflow',
    apiVersion: 'argoproj.io/v1alpha1',
    metadata: {
      name: experimentName,
      namespace: chaosInfrastructureNamespace ?? 'litmus'
    },
    spec: {
      templates: [
        {
          name: experimentName,
          steps: [
            [
              {
                name: 'install-chaos-faults',
                template: 'install-chaos-faults'
              }
            ],
            [
              {
                name: 'cleanup-chaos-resources',
                template: 'cleanup-chaos-resources'
              }
            ]
          ]
        },
        {
          name: 'install-chaos-faults',
          inputs: {
            artifacts: []
          },
          container: {
            name: '',
            image: `${imageRegistry.repo}/k8s:2.11.0`,
            command: ['sh', '-c'],
            args: [
              'kubectl delete chaosexperiments -n {{workflow.parameters.adminModeNamespace}} --all && kubectl apply -f /tmp/ -n {{workflow.parameters.adminModeNamespace}} && faultCount=$(ls /tmp/ | grep -E "(.yaml$|.yml$)" | wc -l) && until [[ $(kubectl get -f /tmp/ --no-headers | wc -l) -eq $faultCount ]]; do sleep 1; kubectl apply -f /tmp/ -n {{workflow.parameters.adminModeNamespace}} ; done; echo "ChaosExperiment CR Ready"',
            ]
          }
        },
        {
          name: 'cleanup-chaos-resources',
          container: {
            name: '',
            image: `${imageRegistry.repo}/k8s:2.11.0`,
            command: ['sh', '-c'],
            args: [
              'kubectl delete chaosengine -l workflow_run_id={{workflow.uid}} -n {{workflow.parameters.adminModeNamespace}}'
            ]
          }
        }
      ],
      entrypoint: experimentName,
      arguments: {
        parameters: [
          {
            name: 'adminModeNamespace',
            value: chaosInfrastructureNamespace ?? 'litmus'
          }
        ]
      },
      serviceAccountName: 'argo-chaos',
      podGC: {
        strategy: 'OnWorkflowCompletion'
      },
      securityContext: {
        runAsUser: 1000,
        runAsNonRoot: true
      },
      ...imagePullSecrets
    }
  };
}
