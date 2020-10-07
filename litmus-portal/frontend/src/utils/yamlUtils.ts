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
      const count = (file.match(/kind: ChaosEngine/g) || []).length;
      if (parsedYaml.kind === 'CronWorkflow') {
        for (let i = 0; i < count; i += 1) {
          const embeddedYaml =
            parsedYaml.spec.workflowSpec.templates[2 + i].inputs.artifacts[0]
              .raw.data;
          nameextractor(embeddedYaml).forEach((test) => {
            testNames.push(test);
          });
        }
      } else {
        for (let i = 0; i < count; i += 1) {
          const embeddedYaml =
            parsedYaml.spec.templates[2 + i].inputs.artifacts[0].raw.data;
          nameextractor(embeddedYaml).forEach((test) => {
            testNames.push(test);
          });
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
