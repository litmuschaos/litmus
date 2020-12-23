/* eslint-disable no-unsafe-finally */
/* eslint-disable no-loop-func */
import YAML from 'yaml';

const nameextractor = (val: any) => {
  const embeddedworkflowyamlstring = val;
  const parsedEmbeddedYaml = YAML.parse(embeddedworkflowyamlstring as string);
  const experimentNames = [''];
  const experimentList = parsedEmbeddedYaml.spec.experiments;

  (experimentList as any).forEach((element: any) => {
    experimentNames.push(element.name);
  });

  if (experimentNames.length >= 2) {
    experimentNames.shift();
  }

  return experimentNames;
};

const parsed = (yaml: string) => {
  const file = yaml;
  if (file === 'error') {
    const testNames = ['none'];
    return testNames;
  }
  let testNames: string[] = [];
  try {
    const parsedYaml = YAML.parse(file as string);
    try {
      if (parsedYaml.kind === 'CronWorkflow') {
        const totalSteps = parsedYaml.spec.workflowSpec.templates.length - 1; // Total Steps in CronWorkflow
        for (let i = 0; i < totalSteps; i++) {
          const TemplateElement = YAML.stringify(
            parsedYaml.spec.workflowSpec.templates[1 + i]
          ); // Accessing Current Step
          if (TemplateElement.match(/kind: ChaosEngine/g)) {
            // Checking if current step contains "kind: ChaosEngine"
            const embeddedYaml =
              parsedYaml.spec.workflowSpec.templates[1 + i].inputs.artifacts[0]
                .raw.data;
            const testName = nameextractor(embeddedYaml);
            testNames.push(...testName);
          }
        }
      } else {
        const totalSteps = parsedYaml.spec.templates.length - 1; // Total Steps in Workflow
        for (let i = 0; i < totalSteps; i++) {
          const TemplateElement = YAML.stringify(
            parsedYaml.spec.templates[1 + i]
          ); // Accessing Current Step
          if (TemplateElement.match(/kind: ChaosEngine/g)) {
            // Checking if current step contains "kind: ChaosEngine"
            const embeddedYaml =
              parsedYaml.spec.templates[1 + i].inputs.artifacts[0].raw.data;
            const testName = nameextractor(embeddedYaml);
            testNames.push(...testName);
          }
        }
      }
    } catch (err) {
      testNames = [];
    } finally {
      return testNames;
    }
  } catch (err) {
    testNames = [];
    return testNames;
  }
};

export default parsed;
