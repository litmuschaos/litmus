import YAML from 'yaml';
import { Steps } from '../../../models/chaosWorkflowYaml';

let steps: Steps[][];

export const extractSteps = (isCustom: boolean, crd: string) => {
  if (isCustom) {
    // If Custom YAML is provided then save the experiments Serially
    const parsedYaml = YAML.parse(crd);
    steps = [];
    parsedYaml.spec.templates.forEach((template: any) => {
      if (template.inputs !== undefined) {
        template.inputs.artifacts.forEach((artifact: any) => {
          const chaosEngine = YAML.parse(artifact.raw.data);
          if (chaosEngine.kind === 'ChaosEngine') {
            steps.push([
              {
                name: chaosEngine.metadata.name,
                template: chaosEngine.metadata.template,
              },
            ]);
          }
        });
      }
    });
  } else {
    // Save the Pre-defined experiments Serial/Parallel

    const parsedYaml = YAML.parse(crd);

    steps = [];

    parsedYaml.spec.templates.forEach((template: any) => {
      if (
        template.name === 'argowf-chaos' &&
        template.steps[1][0].name === 'run-chaos'
      ) {
        // Serialized Steps
        parsedYaml.spec.templates.forEach((template: any) => {
          if (template.name === 'run-chaos') {
            template.inputs.artifacts.forEach((artifact: any) => {
              const chaosEngine = YAML.parse(artifact.raw.data);
              if (chaosEngine.kind === 'ChaosEngine') {
                steps.push([
                  {
                    name: chaosEngine.metadata.name,
                    template: chaosEngine.metadata.template,
                  },
                ]);
              }
            });
          }
        });
      } else if (
        template.name === 'argowf-chaos' &&
        template.steps[1][0].name !== 'run-chaos'
      ) {
        // Nested Steps
        steps = template.steps as Steps[][];
      }
    });
  }
  return steps;
};
