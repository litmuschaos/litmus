import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import YAML from 'yaml';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import BackButton from '../BackButton';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import InputField from '../../../../components/InputField';
import useStyles from './styles';
import { RootState } from '../../../../redux/reducers';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import Loader from '../../../../components/Loader';

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
  const [appInfo, setAppInfo] = useState<AppInfo>({
    appns: 'kube-system',
    applabel: 'k8s-app=kube-proxy',
    appkind: 'daemonset',
  });
  const { t } = useTranslation();
  const workflowDetails = useSelector((state: RootState) => state.workflowData);
  const workflowAction = useActions(WorkflowActions);
  const [expDesc, setExpDesc] = useState('');
  const [loadingEnv, setLoadingEnv] = useState(true);
  const [yaml, setYaml] = useState<string>('');
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
  const [env, setEnv] = useState<EnvValues[]>([]);

  const changeOriginalEnvValue = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    env[index].value = event.target.value;
    setEnv([...env]);
  };
  // Function to fetch workflow description
  const getWorkflowDesc = () => {
    fetch(
      `${workflowDetails.customWorkflow.repoUrl}/raw/${workflowDetails.customWorkflow.repoBranch}/charts/${workflowDetails.customWorkflow.experiment_name}/experiment.yaml`
    )
      .then((data) => {
        data.text().then((yamlText) => {
          const parsedYaml = YAML.parse(yamlText);
          setExpDesc(parsedYaml.description.message);
        });
      })
      .catch((error) => {
        console.error('Error', error);
      });
    if (expDesc) {
      return expDesc;
    }
    return '';
  };
  // UseEffect to fetch the env variables
  useEffect(() => {
    if (workflowDetails.customWorkflow.yaml === '') {
      fetch(workflowDetails.customWorkflow.yamlLink as string)
        .then((data) => {
          data.text().then((yamlText) => {
            const parsedYaml = YAML.parse(yamlText);
            parsedYaml.metadata.name =
              workflowDetails.customWorkflow.experiment_name;
            setEnv([...parsedYaml.spec.experiments[0].spec.components.env]);
            setAppInfo({
              appns: parsedYaml.spec.appinfo.appns,
              applabel: parsedYaml.spec.appinfo.applabel,
              appkind: parsedYaml.spec.appinfo.appkind,
            });
            setYaml(YAML.stringify(parsedYaml));
            setLoadingEnv(false);
          });
        })
        .catch((error) => {
          console.error('Error', error);
        });
    } else {
      const parsedYaml = YAML.parse(
        workflowDetails.customWorkflow.yaml as string
      );
      setAppInfo({
        appns: parsedYaml.spec.appinfo.appns,
        applabel: parsedYaml.spec.appinfo.applabel,
        appkind: parsedYaml.spec.appinfo.appkind,
      });
      setEnv([...parsedYaml.spec.experiments[0].spec.components.env]);
      setYaml(workflowDetails.customWorkflow.yaml as string);
      setLoadingEnv(false);
    }
  }, []);
  // Function to generate sequence of experiemnt
  const experimentSequence = () => {
    const elemPos = workflowDetails.customWorkflows
      .map((exp) => {
        return exp.experiment_name;
      })
      .indexOf(workflowDetails.customWorkflow.experiment_name);
    if (
      (workflowDetails.customWorkflow.index === -1 &&
        workflowDetails.customWorkflows.length === 0) ||
      elemPos === 0
    ) {
      return 'This is your first experiment';
    }
    if (workflowDetails.customWorkflow.index === -1) {
      return `This experiment will execute after 
                  ${
                    workflowDetails.customWorkflows[
                      workflowDetails.customWorkflows.length - 1
                    ].experiment_name
                  }`;
    }
    return `This experiment will execute after 
                  ${
                    workflowDetails.customWorkflows[elemPos - 1].experiment_name
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
    parsedYaml.spec.appinfo.appns = appInfo.appns;
    parsedYaml.spec.appinfo.applabel = appInfo.applabel;
    parsedYaml.spec.appinfo.appkind = appInfo.appkind;
    parsedYaml.metadata.name = workflowDetails.customWorkflow.experiment_name?.split(
      '/'
    )[1];
    parsedYaml.metadata.namespace =
      '{{workflow.parameters.adminModeNamespace}}';
    parsedYaml.spec.chaosServiceAccount = 'litmus-admin';
    const YamlString = YAML.stringify(parsedYaml);
    const experimentArray = workflowDetails.customWorkflows;

    if (workflowDetails.customWorkflow.index === -1) {
      workflowAction.setWorkflowDetails({
        customWorkflows: [
          ...workflowDetails.customWorkflows,
          {
            experiment_name: workflowDetails.customWorkflow.experiment_name,
            hubName: workflowDetails.customWorkflow.hubName,
            repoUrl: workflowDetails.customWorkflow.repoUrl,
            repoBranch: workflowDetails.customWorkflow.repoBranch,
            yamlLink: workflowDetails.customWorkflow.yamlLink,
            yaml: YamlString,
          },
        ],
      });
    } else {
      experimentArray[
        workflowDetails.customWorkflow.index as number
      ].yaml = YamlString;
      workflowAction.setWorkflowDetails({
        customWorkflows: [...experimentArray],
      });
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerDiv}>
        <BackButton isDisabled={false} gotoStep={() => gotoStep(0)} />
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
              {workflowDetails.customWorkflow.experiment_name}
            </Typography>
          </div>
          <div className={classes.inputDiv}>
            <Typography variant="h6" className={classes.mainText}>
              {t('customWorkflow.tuneExperiment.description')}:
            </Typography>
            <Typography className={classes.mainDetail}>
              {getWorkflowDesc()}
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
            <div className={classes.appInfoDiv}>
              <Typography className={classes.appInfoText}>appns:</Typography>
              <InputField
                label="appns"
                styles={{
                  width: '20%',
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
            <div className={classes.appInfoDiv}>
              <Typography className={classes.appInfoText}>applabel:</Typography>
              <InputField
                label="applabel"
                styles={{
                  width: '20%',
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
            <div className={classes.appKind}>
              <Typography className={classes.appInfoText}>appkind:</Typography>
              <InputField
                label="appkind"
                styles={{
                  width: '20%',
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
