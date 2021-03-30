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
      // Extracting Run Chaos Steps and appending to the array
      if (
        template.name === 'argowf-chaos' &&
        template.steps[1][0].name === 'run-chaos'
      ) {
        // Adding install-experiment step
        steps.push([
          {
            name: template.steps[0][0].name,
            template: template.steps[0][0].name,
          },
        ]);

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

        // Adding revert-chaos step
        template.steps.forEach((step: any) => {
          if (step[0].name === 'revert-chaos') {
            steps.push([
              {
                name: step[0].name,
                template: step[0].name,
              },
            ]);
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
