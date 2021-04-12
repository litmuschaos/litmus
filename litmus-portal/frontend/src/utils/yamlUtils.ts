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

export const updateEngineName = (parsedYaml: any) => {
  let engineName = '';
  try {
    if (parsedYaml.spec !== undefined) {
      const yamlData = parsedYaml.spec;
      yamlData.templates.forEach((template: any) => {
        if (template.inputs && template.inputs.artifacts) {
          template.inputs.artifacts.forEach((artifact: any) => {
            const chaosEngine = YAML.parse(artifact.raw.data);
            // Condition to check for the kind as ChaosEngine
            if (chaosEngine.kind === 'ChaosEngine') {
              const updatedEngineName = `${
                chaosEngine.metadata.name
              }-${Math.round(new Date().getTime() / 1000)}`;
              chaosEngine.metadata.name = updatedEngineName;

              // Condition to check the namespace
              if (typeof chaosEngine.metadata.namespace === 'object') {
                // Removes any whitespace in '{{workflow.parameters.adminModeNamespace}}'
                const namespace = Object.keys(
                  chaosEngine.metadata.namespace
                )[0].replace(/\s/g, '');
                chaosEngine.metadata.namespace = `{${namespace}}`;
              }

              // Edge Case: Condition to check the appns
              // Required because while parsing the chaos engine
              // '{{workflow.parameters.adminModeNamespace}}' changes to a JSON object
              if (typeof chaosEngine.spec.appinfo.appns === 'object') {
                // Removes any whitespace in '{{workflow.parameters.adminModeNamespace}}'
                const appns = Object.keys(
                  chaosEngine.spec.appinfo.appns
                )[0].replace(/\s/g, '');
                chaosEngine.spec.appinfo.appns = `{${appns}}`;
              }
              engineName += `${updatedEngineName} `;
            }
            // Update the artifact in template
            const artifactData = artifact;
            artifactData.raw.data = YAML.stringify(chaosEngine);
          });
        }
        if (template.name.includes('revert-')) {
          // Update the args in revert chaos template
          const revertTemplate = template;
          revertTemplate.container.args[0] = `kubectl delete chaosengine ${engineName} -n {{workflow.parameters.adminModeNamespace}}`;
        }
      });
    }
    return YAML.stringify(parsedYaml);
  } catch (err) {
    console.error(err);
    return YAML.stringify(parsedYaml);
  }
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

export const fetchWorkflowNameFromManifest = (manifest: string) => {
  return YAML.parse(manifest).metadata.name;
};

export const getWorkflowParameter = (parameterString: string) => {
  return parameterString
    .substring(1, parameterString.length - 1)
    .replace(/^\s+|\s+$/gm, '')
    .split('.')[2];
};

export const generateChaosQuery = (
  chaosQueryStringTemplate: string,
  engineName: string,
  namespace: string
) => {
  const queryStringWithEngineName: string = chaosQueryStringTemplate.replaceAll(
    '#{}',
    engineName
  );
  return queryStringWithEngineName.replaceAll('*{}', namespace);
};

// This is a utility function for extracting embedded
// yaml as a string for chaosengine with provided name
export const stepEmbeddedYAMLExtractor = (
  manifest: string,
  stepName: string
) => {
  const file = manifest;
  let embeddedYaml = '';
  try {
    const parsedYaml = YAML.parse(file as string);
    try {
      if (parsedYaml.kind === 'CronWorkflow') {
        const totalSteps = parsedYaml.spec.workflowSpec.templates.length - 1; // Total Steps in CronWorkflow
        for (let i = 0; i < totalSteps; i++) {
          if (parsedYaml.spec.workflowSpec.templates[1 + i].name === stepName) {
            embeddedYaml =
              parsedYaml.spec.workflowSpec.templates[1 + i].inputs.artifacts[0]
                .raw.data;
            break;
          }
        }
      } else {
        const totalSteps = parsedYaml.spec.templates.length - 1; // Total Steps in Workflow
        for (let i = 0; i < totalSteps; i++) {
          if (parsedYaml.spec.templates[1 + i].name === stepName) {
            embeddedYaml =
              parsedYaml.spec.templates[1 + i].inputs.artifacts[0].raw.data;
            break;
          }
        }
      }
    } catch (err) {
      embeddedYaml = '';
    } finally {
      return embeddedYaml;
    }
  } catch (err) {
    embeddedYaml = '';
    return embeddedYaml;
  }
};

export default parsed;
