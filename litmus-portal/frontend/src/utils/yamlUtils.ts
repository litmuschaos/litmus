/* eslint-disable no-unsafe-finally */
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
      const embeddedYaml =
        parsedYaml.spec.templates[1].inputs.artifacts[0].raw.data;
      testNames = nameextractor(embeddedYaml);
    } catch (err) {
      testNames = ['Invalid CRD'];
    } finally {
      return testNames;
    }
  } catch (err) {
    testNames = ['Yaml Error'];
    return testNames;
  }
};

export default parsed;
