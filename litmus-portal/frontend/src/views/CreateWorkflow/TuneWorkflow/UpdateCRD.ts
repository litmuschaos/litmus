import YAML from 'yaml';
import { CustomYAML, Steps } from '../../../models/redux/customyaml';

interface WorkflowExperiment {
  ChaosEngine: string;
  Experiment: string;
}

// Initial step in experiment
const customSteps: Steps[][] = [
  [
    {
      name: 'install-chaos-experiments',
      template: 'install-chaos-experiments',
    },
  ],
];
let installAllExp = '';

export const updateCRD = (
  crd: CustomYAML,
  experiment: WorkflowExperiment[]
) => {
  const generatedYAML: CustomYAML = crd;

  const modifyYAML = (link: string) => {
    customSteps.push([
      {
        name: YAML.parse(link as string).metadata.name,
        template: YAML.parse(link as string).metadata.name,
      },
    ]);
    installAllExp = `${installAllExp}kubectl apply -f /tmp/${
      YAML.parse(link as string).metadata.name
    }.yaml -n {{workflow.parameters.adminModeNamespace}} | `;
  };

  experiment.forEach((exp) => {
    modifyYAML(Object.values(exp.Experiment)[0]);
  });

  // Step 1 in template (creating array of chaos-steps)
  generatedYAML.spec.templates[0] = {
    name: 'custom-chaos',
    steps: customSteps,
  };

  if (experiment.length === 0) {
    generatedYAML.spec.templates[0] = {
      name: 'custom-chaos',
      steps: [],
    };
    // Step 2 in template (experiment YAMLs of all experiments)
    generatedYAML.spec.templates[1] = {
      name: 'install-chaos-experiments',
      inputs: {
        artifacts: [],
      },
      container: {
        args: [`${installAllExp}sleep 30`],
        command: ['sh', '-c'],
        image: 'alpine/k8s:1.18.2',
      },
    };
  }

  // Step 3 in template (engine YAMLs of all experiments)
  experiment.forEach((data) => {
    const ExperimentYAML = YAML.parse(Object.values(data.Experiment)[0]);
    ExperimentYAML.metadata.name = YAML.parse(
      Object.values(data.Experiment)[0]
    ).metadata.name;
    ExperimentYAML.metadata.namespace =
      '{{workflow.parameters.adminModeNamespace}}';
    const artifacts = generatedYAML.spec.templates[1].inputs?.artifacts;
    if (artifacts !== undefined) {
      artifacts.push({
        name: ExperimentYAML.metadata.name,
        path: `/tmp/${ExperimentYAML.metadata.name}.yaml`,
        raw: {
          data: YAML.stringify(ExperimentYAML),
        },
      });
    }
    const ChaosEngine = YAML.parse(Object.values(data.ChaosEngine)[0]);
    ChaosEngine.metadata.name = YAML.parse(
      Object.values(data.Experiment)[0]
    ).metadata.name;
    ChaosEngine.metadata.namespace =
      '{{workflow.parameters.adminModeNamespace}}';

    generatedYAML.spec.templates.push({
      name: ChaosEngine.metadata.name,
      inputs: {
        artifacts: [
          {
            name: ChaosEngine.metadata.name,
            path: `/tmp/chaosengine-${ChaosEngine.metadata.name}.yaml`,
            raw: {
              data: YAML.stringify(ChaosEngine),
            },
          },
        ],
      },
      container: {
        args: [
          `-file=/tmp/chaosengine-${ChaosEngine.metadata.name}.yaml`,
          `-saveName=/tmp/engine-name`,
        ],
        image: 'litmuschaos/litmus-checker:latest',
      },
    });
  });

  // console.log(generatedYAML);
  // console.log(customSteps);
  return generatedYAML;

  // Uncomment for Checking the Generated YAML and custom steps
};
