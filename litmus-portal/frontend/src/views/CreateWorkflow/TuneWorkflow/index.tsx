import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import Loader from '../../../components/Loader';
import YamlEditor from '../../../components/YamlEditor/Editor';
import { WorkflowData } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';

const TuneWorkflow: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );

  const workflow = useActions(WorkflowActions);

  const {
    name,
    link,
    yaml,
    id,
    description,
    chaosEngineChanged,
  } = workflowData;

  const [isLoading, loadStateChanger] = useState(true);

  const [yamlFile, setYamlFile] = useState(`${link}`);

  // Function to change the ChaosEngine names
  const changeEngineName = (parsedYaml: any) => {
    let engineName = '';
    try {
      if (parsedYaml.spec !== undefined && !chaosEngineChanged) {
        const yamlData = parsedYaml.spec;
        yamlData.templates.forEach((template: any) => {
          if (template.inputs !== undefined) {
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
          if (
            template.name === 'revert-chaos' ||
            template.name === 'revert-kube-proxy-chaos'
          ) {
            // Update the args in revert chaos template
            const revertTemplate = template;
            revertTemplate.container.args[0] = `kubectl delete chaosengine ${engineName} -n {{workflow.parameters.adminModeNamespace}}`;
          }
        });
      }
      workflow.setWorkflowDetails({
        chaosEngineChanged: true,
      });
      return YAML.stringify(parsedYaml);
    } catch (err) {
      console.error(err);
      return YAML.stringify(parsedYaml);
    }
  };

  function fetchYaml(link: string) {
    fetch(link)
      .then((data) => {
        data.text().then((yamlText) => {
          const parsedYaml = YAML.parse(yamlText);
          delete parsedYaml.metadata.generateName;
          parsedYaml.metadata.name = workflowData.name;
          const modifiedYAML = changeEngineName(parsedYaml);
          setYamlFile(modifiedYAML);
          workflow.setWorkflowDetails({
            name,
            link,
            yaml: modifiedYAML,
            id,
            description,
          });
          loadStateChanger(false);
        });
      })
      .catch((err) => {
        console.error(`Unable to fetch the yaml text${err}`);
      });
  }

  useEffect(() => {
    if (yaml === 'none' || yaml === '') {
      fetchYaml(link);
    } else {
      const modifiedYAML = changeEngineName(YAML.parse(yaml));
      workflow.setWorkflowDetails({
        yaml: modifiedYAML,
      });
      setYamlFile(modifiedYAML);
      loadStateChanger(false);
    }
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.tuneDiv}>
        <Typography className={classes.heading}>
          <strong>{t('createWorkflow.tuneWorkflow.header')}</strong>
        </Typography>
        <Typography className={classes.description}>
          {t('createWorkflow.tuneWorkflow.info')}
        </Typography>
        <Typography className={classes.descriptionextended}>
          {t('createWorkflow.tuneWorkflow.infoExtended')}
        </Typography>
      </div>

      <Divider variant="middle" className={classes.horizontalLine} />

      <Divider variant="middle" className={classes.horizontalLine} />

      <div className={classes.editorfix}>
        <YamlEditor
          content={yamlFile}
          filename={name}
          yamlLink={link}
          id={id}
          description={description}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default TuneWorkflow;
