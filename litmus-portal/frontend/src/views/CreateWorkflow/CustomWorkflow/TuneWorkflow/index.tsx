import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import YAML from 'yaml';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLazyQuery } from '@apollo/client';
import BackButton from '../BackButton';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import InputField from '../../../../components/InputField';
import useStyles from './styles';
import { RootState } from '../../../../redux/reducers';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import Loader from '../../../../components/Loader';
import { GET_ENGINE_YAML } from '../../../../graphql/quries';

interface EnvValues {
  name: string;
  value: string;
}

interface VerifyCommitProps {
  gotoStep: (page: number) => void;
}

interface AppInfo {
  appns: string;
  applabel: string;
  appkind: string;
}

const TuneCustomWorkflow: React.FC<VerifyCommitProps> = ({ gotoStep }) => {
  const classes = useStyles();
  const [overrideEnvs, setOverrideEnvs] = useState<EnvValues[]>([
    { name: '', value: '' },
  ]);
  const { customWorkflow, customWorkflows } = useSelector(
    (state: RootState) => state.workflowData
  );
  const [appInfo, setAppInfo] = useState<AppInfo>({
    appns: 'kube-system',
    applabel: 'k8s-app=kube-proxy',
    appkind: 'daemonset',
  });
  const [annotation, setAnnotation] = useState('true');
  const [env, setEnv] = useState<EnvValues[]>([]);
  const [yaml, setYaml] = useState<string>('');
  const [loadingEnv, setLoadingEnv] = useState(true);

  const { t } = useTranslation();
  const userData = useSelector((state: RootState) => state.userData);
  const [getEngineYaml] = useLazyQuery(GET_ENGINE_YAML, {
    onCompleted: (data) => {
      const parsedYaml = YAML.parse(data.getYAMLData);
      setEnv([...parsedYaml.spec.experiments[0].spec.components.env]);
      if (parsedYaml.spec.appinfo !== undefined) {
        setAppInfo({
          appns: parsedYaml.spec.appinfo.appns,
          applabel: parsedYaml.spec.appinfo.applabel,
          appkind: parsedYaml.spec.appinfo.appkind,
        });
      }
      setAnnotation(parsedYaml.spec.annotationCheck);
      setYaml(YAML.stringify(parsedYaml));
      setLoadingEnv(false);
    },
  });

  const workflowAction = useActions(WorkflowActions);

  const changeKey = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    overrideEnvs[index].name = event.target.value;
    setOverrideEnvs([...overrideEnvs]);
  };
  const changeValue = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    overrideEnvs[index].value = event.target.value;
    setOverrideEnvs([...overrideEnvs]);
  };
  const AddEnvPair = () => {
    setOverrideEnvs([...overrideEnvs, { name: '', value: '' }]);
  };

  const changeOriginalEnvValue = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    env[index].value = event.target.value;
    setEnv([...env]);
  };

  // UseEffect to fetch the env variables
  useEffect(() => {
    if (customWorkflow.yaml === '') {
      getEngineYaml({
        variables: {
          experimentInput: {
            ProjectID: userData.selectedProjectID,
            HubName: customWorkflow.hubName,
            ChartName: customWorkflow.experiment_name.split('/')[0],
            ExperimentName: customWorkflow.experiment_name.split('/')[1],
            FileType: 'engine',
          },
        },
      });
    } else {
      const parsedYaml = YAML.parse(customWorkflow.yaml as string);
      if (parsedYaml.spec.appinfo !== undefined) {
        setAppInfo({
          appns: parsedYaml.spec.appinfo.appns,
          applabel: parsedYaml.spec.appinfo.applabel,
          appkind: parsedYaml.spec.appinfo.appkind,
        });
      }
      setAnnotation(parsedYaml.spec.annotationCheck);
      setEnv([...parsedYaml.spec.experiments[0].spec.components.env]);
      setYaml(customWorkflow.yaml as string);
      setLoadingEnv(false);
    }
  }, []);
  // Function to generate sequence of experiemnt
  const experimentSequence = () => {
    const elemPos = customWorkflows
      .map((exp) => {
        return exp.experiment_name;
      })
      .indexOf(customWorkflow.experiment_name);
    if (
      (customWorkflow.index === -1 && customWorkflows.length === 0) ||
      elemPos === 0
    ) {
      return t('customWorkflow.tuneExperiment.sequenceFirstExp');
    }
    if (customWorkflow.index === -1) {
      return `${t('customWorkflow.tuneExperiment.sequenceNotFirstExp')} ${
        customWorkflows[customWorkflows.length - 1].experiment_name
      }`;
    }
    return `${t('customWorkflow.tuneExperiment.sequenceNotFirstExp')} ${
      customWorkflows[elemPos - 1].experiment_name
    }`;
  };
  // Function to handle the change in env variables
  const handleEnvModification = () => {
    const newEnvs: EnvValues[] = [];
    const hashEnv = new Map();
    env.forEach((envPair) => {
      hashEnv.set(envPair.name, envPair.value);
    });
    overrideEnvs.forEach((envPair) => {
      if (hashEnv.has(envPair.name)) {
        hashEnv.delete(envPair.name);
        hashEnv.set(envPair.name, envPair.value);
      } else {
        hashEnv.set(envPair.name, envPair.value);
      }
    });
    hashEnv.forEach((value, key) => {
      if (key !== '') {
        newEnvs.push({ name: key, value });
      }
    });
    const parsedYaml = YAML.parse(yaml);
    parsedYaml.spec.experiments[0].spec.components.env = newEnvs;
    if (parsedYaml.spec.appinfo !== undefined) {
      parsedYaml.spec.appinfo.appns = appInfo.appns;
      parsedYaml.spec.appinfo.applabel = appInfo.applabel;
      parsedYaml.spec.appinfo.appkind = appInfo.appkind;
    }
    parsedYaml.spec.annotationCheck = annotation;
    parsedYaml.metadata.name = customWorkflow.experiment_name?.split('/')[1];
    parsedYaml.metadata.namespace =
      '{{workflow.parameters.adminModeNamespace}}';
    parsedYaml.spec.chaosServiceAccount = 'litmus-admin';
    const YamlString = YAML.stringify(parsedYaml);
    const experimentArray = customWorkflows;

    if (customWorkflow.index === -1) {
      workflowAction.setWorkflowDetails({
        customWorkflows: [
          ...customWorkflows,
          {
            experiment_name: customWorkflow.experiment_name,
            hubName: customWorkflow.hubName,
            repoUrl: customWorkflow.repoUrl,
            repoBranch: customWorkflow.repoBranch,
            yamlLink: customWorkflow.yamlLink,
            yaml: YamlString,
            description: customWorkflow.description,
          },
        ],
      });
    } else {
      experimentArray[customWorkflow.index as number].yaml = YamlString;
      workflowAction.setWorkflowDetails({
        customWorkflows: [...experimentArray],
      });
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerDiv}>
        {customWorkflow.index === -1 ? (
          <BackButton isDisabled={false} onClick={() => gotoStep(0)} />
        ) : null}
        <Typography variant="h3" className={classes.headerText} gutterBottom>
          {t('customWorkflow.tuneExperiment.headerText')}
        </Typography>
        <Typography className={classes.headerDesc}>
          {t('customWorkflow.tuneExperiment.addKey')}
        </Typography>
      </div>
      <div className={classes.workflowDiv}>
        <Typography variant="h4">
          <strong> {t('customWorkflow.tuneExperiment.experimentInfo')}</strong>
        </Typography>
        <div>
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.mainText}>
              {t('customWorkflow.tuneExperiment.expName')}:
            </Typography>
            <Typography className={classes.mainDetail}>
              {customWorkflow.experiment_name}
            </Typography>
          </div>
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.mainText}>
              {t('customWorkflow.tuneExperiment.description')}:
            </Typography>
            <Typography className={classes.mainDetail}>
              {customWorkflow.description}
            </Typography>
          </div>
          <hr className={classes.horizontalLineHeader} />
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.mainText}>
              {t('customWorkflow.tuneExperiment.sequence')}:
            </Typography>
            <Typography className={classes.mainDetail}>
              {experimentSequence()}
            </Typography>
          </div>
        </div>
        <hr className={classes.horizontalLineHeader} />
        {loadingEnv ? (
          <Loader />
        ) : (
          <div className={classes.appInfoMainDiv}>
            <Typography className={classes.appInfoHeader}>
              {t('customWorkflow.tuneExperiment.appInfo')}
            </Typography>
            {YAML.parse(yaml).spec.appinfo?.appns ? (
              <div className={classes.appInfoDiv}>
                <Typography className={classes.appInfoText}>appns:</Typography>
                <div className={classes.inputField}>
                  <InputField
                    label="appns"
                    styles={{
                      width: '100%',
                    }}
                    data-cy="inputWorkflow"
                    validationError={false}
                    handleChange={(event) =>
                      setAppInfo({
                        ...appInfo,
                        appns: event.target.value.toLowerCase(),
                      })
                    }
                    value={appInfo.appns}
                  />
                </div>
              </div>
            ) : null}
            {YAML.parse(yaml).spec.appinfo?.applabel ? (
              <div className={classes.appInfoDiv}>
                <Typography className={classes.appInfoText}>
                  applabel:
                </Typography>
                <div className={classes.inputField}>
                  <InputField
                    label="applabel"
                    styles={{
                      width: '100%',
                    }}
                    data-cy="inputWorkflow"
                    validationError={false}
                    handleChange={(event) =>
                      setAppInfo({
                        ...appInfo,
                        applabel: event.target.value.toLowerCase(),
                      })
                    }
                    value={appInfo.applabel}
                  />
                </div>
              </div>
            ) : null}
            {YAML.parse(yaml).spec.appinfo?.appkind ? (
              <div className={classes.appKind}>
                <Typography className={classes.appInfoText}>
                  appkind:
                </Typography>
                <div className={classes.inputField}>
                  <InputField
                    label="appkind"
                    styles={{
                      width: '100%',
                    }}
                    data-cy="inputWorkflow"
                    validationError={false}
                    handleChange={(event) =>
                      setAppInfo({
                        ...appInfo,
                        appkind: event.target.value.toLowerCase(),
                      })
                    }
                    value={appInfo.appkind}
                  />
                </div>
              </div>
            ) : null}
            {YAML.parse(yaml).spec.annotationCheck ? (
              <div className={classes.appKind}>
                <Typography className={classes.appInfoText}>
                  annotationCheck:
                </Typography>
                <div className={classes.inputField}>
                  <InputField
                    label="annotationCheck"
                    styles={{
                      width: '100%',
                    }}
                    data-cy="inputWorkflow"
                    validationError={false}
                    handleChange={(event) => setAnnotation(event.target.value)}
                    value={annotation}
                  />
                </div>
              </div>
            ) : null}
            <hr className={classes.horizontalLine} />
            <Typography className={classes.envHeader}>
              {t('customWorkflow.tuneExperiment.envText')}
            </Typography>
            {env.map((data, index) => (
              <div className={classes.inputDiv}>
                <Typography className={classes.envName}>{data.name}</Typography>
                <InputField
                  label="Value"
                  styles={{
                    width: '40%',
                  }}
                  data-cy="inputWorkflow"
                  validationError={false}
                  handleChange={(event) => changeOriginalEnvValue(index, event)}
                  value={data.value}
                />
              </div>
            ))}
            <hr className={classes.horizontalLine} />
          </div>
        )}
        <div className={classes.customEnvDiv}>
          <Typography className={classes.envHeader}>
            {t('customWorkflow.tuneExperiment.customEnvText')}
          </Typography>
          {overrideEnvs.map((data, index) => (
            <div className={classes.inputDivEnv}>
              <InputField
                label="Key"
                styles={{
                  width: '40%',
                }}
                data-cy="inputWorkflow"
                validationError={false}
                handleChange={(event) => changeKey(index, event)}
                value={data.name}
              />
              <InputField
                label="Value"
                styles={{
                  width: '40%',
                }}
                data-cy="inputWorkflow"
                validationError={false}
                handleChange={(event) => changeValue(index, event)}
                value={data.value}
              />
              {overrideEnvs[index + 1] ? null : (
                <div className={classes.addEnvBtn}>
                  <ButtonFilled
                    handleClick={() => {
                      AddEnvPair();
                    }}
                    isPrimary={false}
                    isDisabled={
                      !!(
                        overrideEnvs[index].name === '' ||
                        overrideEnvs[index].value === ''
                      )
                    }
                  >
                    {t('customWorkflow.tuneExperiment.addEnv')}
                  </ButtonFilled>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={classes.nextBtn}>
        <ButtonFilled
          handleClick={() => {
            handleEnvModification();
            gotoStep(2);
          }}
          isPrimary
          isDisabled={loadingEnv}
        >
          <div>
            <img
              alt="next"
              src="/icons/tick.svg"
              className={classes.nextArrow}
            />
            {t('customWorkflow.tuneExperiment.addExp')}
          </div>
        </ButtonFilled>
      </div>
    </div>
  );
};
export default TuneCustomWorkflow;
