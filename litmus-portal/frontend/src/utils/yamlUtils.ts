/* eslint-disable no-unsafe-finally */
/* eslint-disable no-loop-func */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import YAML from 'yaml';
import { constants } from '../constants';
import { ImageRegistryInfo } from '../models/redux/image_registry';
import { experimentMap } from '../models/redux/workflow';

const validateNamespace = (chaosEngine: any) => {
  // Condition to check the namespace
  if (typeof chaosEngine.metadata.namespace === 'object') {
    // Removes any whitespace in '{{workflow.parameters.adminModeNamespace}}'
    const namespace = Object.keys(chaosEngine.metadata.namespace)[0].replace(
      /\s/g,
      ''
    );
    chaosEngine.metadata.namespace = `{${namespace}}`;
  }
};
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
  let engineInstance: string = '';
  try {
    if (parsedYaml.spec !== undefined) {
      const yamlData = parsedYaml.spec;
      yamlData.templates.forEach((template: any) => {
        if (template.inputs && template.inputs.artifacts) {
          template.inputs.artifacts.forEach((artifact: any) => {
            const chaosEngine = YAML.parse(artifact.raw.data);
            validateNamespace(chaosEngine);
            // Condition to check for the kind as ChaosEngine
            if (chaosEngine.kind === 'ChaosEngine') {
              if (chaosEngine.metadata.generateName === undefined) {
                chaosEngine.metadata['generateName'] =
                  chaosEngine.metadata.name;
                delete chaosEngine.metadata.name;
              }
              chaosEngine.metadata['labels'] = {
                instance_id: uuidv4(),
              };
              validateNamespace(chaosEngine);

              // Edge Case: Condition to check the appns
              // Required because while parsing the chaos engine
              // '{{workflow.parameters.adminModeNamespace}}' changes to a JSON object
              if (chaosEngine.spec.appinfo && chaosEngine.spec.appinfo.appns)
                if (typeof chaosEngine.spec.appinfo.appns === 'object') {
                  // Removes any whitespace in '{{workflow.parameters.adminModeNamespace}}'
                  const appns = Object.keys(
                    chaosEngine.spec.appinfo.appns
                  )[0].replace(/\s/g, '');
                  chaosEngine.spec.appinfo.appns = `{${appns}}`;
                }
              engineInstance += `${chaosEngine.metadata.labels['instance_id']}, `;
            }
            // Update the artifact in template
            const artifactData = artifact;
            artifactData.raw.data = YAML.stringify(chaosEngine);
          });
        }
        if (template.name.includes('revert-')) {
          // Update the args in revert chaos template
          const revertTemplate = template;
          revertTemplate.container.args[0] = `kubectl delete chaosengine -l 'instance_id in (${engineInstance})' -n {{workflow.parameters.adminModeNamespace}} `;
        }
      });
    }
    return YAML.stringify(parsedYaml);
  } catch (err) {
    console.error(err);
    return YAML.stringify(parsedYaml);
  }
};

export const updateWorkflowNameLabel = (
  parsedYaml: any,
  workflowName: string
) => {
  try {
    if (parsedYaml.spec !== undefined) {
      const yamlData =
        parsedYaml.kind === constants.workflow
          ? parsedYaml.spec
          : parsedYaml.spec.workflowSpec;
      yamlData.templates.forEach((template: any) => {
        if (template.inputs && template.inputs.artifacts) {
          template.inputs.artifacts.forEach((artifact: any) => {
            const chaosEngine = YAML.parse(artifact.raw.data);
            validateNamespace(chaosEngine);
            // Condition to check for the kind as ChaosEngine
            if (chaosEngine.kind === 'ChaosEngine') {
              if (chaosEngine.metadata.labels !== undefined) {
                chaosEngine.metadata.labels['workflow_name'] = workflowName;
              } else {
                chaosEngine.metadata['labels'] = {
                  workflow_name: workflowName,
                };
              }

              validateNamespace(chaosEngine);

              // Edge Case: Condition to check the appns
              // Required because while parsing the chaos engine
              // '{{workflow.parameters.adminModeNamespace}}' changes to a JSON object
              if (chaosEngine.spec.appinfo && chaosEngine.spec.appinfo.appns)
                if (typeof chaosEngine.spec.appinfo.appns === 'object') {
                  // Removes any whitespace in '{{workflow.parameters.adminModeNamespace}}'
                  const appns = Object.keys(
                    chaosEngine.spec.appinfo.appns
                  )[0].replace(/\s/g, '');
                  chaosEngine.spec.appinfo.appns = `{${appns}}`;
                }
            }
            // Update the artifact in template
            const artifactData = artifact;
            artifactData.raw.data = YAML.stringify(chaosEngine);
          });
        }
      });
    }
    return parsedYaml;
  } catch (err) {
    console.error(err);
    return parsedYaml;
  }
};

export const getInstanceID = (parsedYaml: any) => {
  let instance_id: string = '';
  try {
    if (parsedYaml.spec !== undefined) {
      const yamlData =
        parsedYaml.kind === constants.workflow
          ? parsedYaml.spec
          : parsedYaml.spec.workflowSpec;
      yamlData.templates.forEach((template: any) => {
        if (template.inputs && template.inputs.artifacts) {
          template.inputs.artifacts.forEach((artifact: any) => {
            const chaosEngine = YAML.parse(artifact.raw.data);
            // Condition to check for the kind as ChaosEngine
            if (chaosEngine.kind === 'ChaosEngine') {
              if (chaosEngine.metadata.labels !== undefined) {
                instance_id += `${chaosEngine.metadata.labels['instance_id']}, `;
              }
            }
          });
        }
      });
    }
    return instance_id;
  } catch (err) {
    console.error(err);
    return '';
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

export const addWeights = (manifest: string) => {
  const arr: experimentMap[] = [];
  const hashMap = new Map();
  const tests = parsed(manifest);
  if (tests.length) {
    tests.forEach((test) => {
      let value = 10;
      if (hashMap.has(test)) {
        value = hashMap.get(test);
      }
      arr.push({ experimentName: test, weight: value });
    });
  } else {
    arr.push({ experimentName: '', weight: 0 });
  }
  localforage.setItem('weights', arr);
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

export const updateNamespace = (manifest: string, namespace: string) => {
  const updatedManifest = YAML.parse(manifest);
  updatedManifest.metadata.namespace = namespace;
  if (updatedManifest.kind.toLowerCase() === 'workflow')
    updatedManifest.spec.arguments.parameters.forEach(
      (parameter: any, index: number) => {
        if (parameter.name === constants.adminMode) {
          updatedManifest.spec.arguments.parameters[index].value = namespace;
        }
      }
    );
  if (updatedManifest.kind.toLowerCase() === 'cronworkflow')
    updatedManifest.spec.workflowSpec.arguments.parameters.forEach(
      (parameter: any, index: number) => {
        if (parameter.name === constants.adminMode) {
          updatedManifest.spec.workflowSpec.arguments.parameters[index].value =
            namespace;
        }
      }
    );
  return updatedManifest;
};

export const updateNamespaceForUpload = (
  manifest: string,
  namespace: string
) => {
  const updatedManifest = YAML.parse(manifest, { prettyErrors: true });
  updatedManifest.metadata.namespace = namespace;
  return updatedManifest;
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

/**
 * updateManifestImage updates the image registry of the workflow manifest
 */
export const updateManifestImage = (
  parsedYaml: any,
  registryData: ImageRegistryInfo
) => {
  if (registryData.update_registry) {
    if (parsedYaml.spec !== undefined) {
      if (parsedYaml.kind.toLowerCase() === 'workflow') {
        if (
          registryData.image_registry_type.toLocaleLowerCase() === 'private'
        ) {
          parsedYaml.spec['imagePullSecrets'] = [
            {
              name: registryData.secret_name,
            },
          ];
        }
        parsedYaml.spec.templates.forEach((template: any) => {
          if (template.container) {
            if (!registryData.is_default) {
              const imageData = template.container.image.split('/');
              const imageName = imageData[imageData.length - 1];
              template.container.image = `${registryData.image_registry_name}/${registryData.image_repo_name}/${imageName}`;
            } else {
              const imageData = template.container.image.split('/');
              const imageName = imageData[imageData.length - 1];
              template.container.image = `${constants.litmus}/${imageName}`;
            }
          }
        });
      }
      if (parsedYaml.kind.toLowerCase() === 'cronworkflow') {
        if (
          registryData.image_registry_type.toLocaleLowerCase() === 'private'
        ) {
          parsedYaml.spec.workflowSpec['imagePullSecrets'] = [
            {
              name: registryData.secret_name,
            },
          ];
        }
        parsedYaml.spec.workflowSpec.templates.forEach((template: any) => {
          if (template.container) {
            if (!registryData.is_default) {
              const imageData = template.container.image.split('/');
              const imageName = imageData[imageData.length - 1];
              template.container.image = `${registryData.image_registry_name}/${registryData.image_repo_name}/${imageName}`;
            } else {
              const imageData = template.container.image.split('/');
              const imageName = imageData[imageData.length - 1];
              template.container.image = `${constants.litmus}/${imageName}`;
            }
          }
        });
      }
    }
  }
  return YAML.stringify(parsedYaml);
};

export const updateChaosExpCRDImage = (
  chaosExp: string,
  registryData: ImageRegistryInfo
) => {
  const chaosExpCRD = YAML.parse(chaosExp);
  if (
    chaosExpCRD?.kind.toLowerCase() === 'chaosexperiment' &&
    chaosExpCRD?.spec &&
    chaosExpCRD?.spec?.definition
  ) {
    const chaosExpDef = chaosExpCRD.spec.definition;
    if (registryData.update_registry) {
      if (!registryData.is_default) {
        const imageData = chaosExpDef.image.split('/');
        const imageName = imageData[imageData.length - 1];
        chaosExpDef.image = `${registryData.image_registry_name}/${registryData.image_repo_name}/${imageName}`;
      } else {
        const imageData = chaosExpDef.image.split('/');
        const imageName = imageData[imageData.length - 1];
        chaosExpDef.image = `${constants.litmus}/${imageName}`;
      }
    }
  }
  return YAML.stringify(chaosExpCRD);
};

export const isCronWorkflow = (manifest: any): boolean => {
  if (manifest.kind.toLowerCase() === 'workflow') {
    return false;
  }
  if (manifest.kind.toLowerCase() === 'cronworkflow') {
    return true;
  }
  return false;
};

export const validateExperimentNames = (manifest: any): boolean => {
  const value: any = [];
  if (manifest.spec !== undefined) {
    const yamlData =
      manifest.kind === constants.workflow
        ? manifest.spec
        : manifest.spec.workflowSpec;
    yamlData.templates[0].steps.forEach((step: any) => {
      step.forEach((values: any) => {
        // if exp name exists append the count
        if (value[`${values.name}`]) {
          const val = value[`${values.name}`] + 1;
          value[`${values.name}`] = val;
        }
        // else set the default count as 1
        else {
          value[`${values.name}`] = 1;
        }
      });
    });
  }

  // filter the experiment if it is occuring more than 1
  const exp = Object.entries(value).filter(
    ([, value]) => (value as number) > 1
  ).length;

  // if any experiment exists (with more than 1 occurance)
  if (exp > 0) {
    return false;
  }
  return true;
};

export const extractEngineNames = (manifest: string) => {
  const engineNames: string[] = [];
  const parsedManifest = YAML.parse(manifest);
  if (parsedManifest.spec !== undefined) {
    const yamlData =
      parsedManifest.kind === constants.workflow
        ? parsedManifest.spec
        : parsedManifest.spec.workflowSpec;
    yamlData.templates.forEach((template: any) => {
      template?.inputs?.artifacts.forEach((artifact: any) => {
        if (artifact?.raw?.data) {
          const artifactManifest = YAML.parse(artifact.raw.data);
          if (artifactManifest.kind === 'ChaosEngine') {
            engineNames.push(artifactManifest.metadata.generateName);
          }
        }
      });
    });
  }
  return engineNames;
};
