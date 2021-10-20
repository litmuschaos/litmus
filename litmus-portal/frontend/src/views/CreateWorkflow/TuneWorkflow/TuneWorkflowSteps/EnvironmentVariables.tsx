import { Button, Typography } from '@material-ui/core';
import { ButtonFilled, InputField } from 'litmus-ui';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import AddIcon from '@material-ui/icons/Add';
import { WorkflowManifest } from '../../../../models/redux/workflow';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { RootState } from '../../../../redux/reducers';
import useStyles from './styles';

interface EnvVariableProps {
  engineIndex: number;
  gotoStep: (page: number) => void;
  closeStepper: () => void;
}

interface EnvValues {
  name: string;
  value: string;
}

const EnvironmentVariables: React.FC<EnvVariableProps> = ({
  gotoStep,
  engineIndex,
  closeStepper,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const workflow = useActions(WorkflowActions);
  const manifest: WorkflowManifest = useSelector(
    (state: RootState) => state.workflowManifest
  );

  /**
   * State variable for managing the additional key-value pair
   */
  const [addEnv, setAddEnv] = useState<EnvValues>({
    name: '',
    value: '',
  });

  /**
   * State variable to display Show More / Show Less
   */
  const [showMore, setShowMore] = useState(false);
  const engine = useSelector(
    (state: RootState) => state.workflowManifest.engineYAML
  );
  const engineYAML = YAML.parse(engine);

  /**
   * State variable to store all the env varaibles from the engine
   */
  const [env, setEnvs] = useState<EnvValues[]>(
    engineYAML.spec.experiments[0].spec.components.env
  );

  /**
   * getShowMoreItems functions returns all the envs
   * if showMore is true, else this returns maximum of
   * 3 envs.
   */
  const getShowMoreItems = (env: EnvValues[]) => {
    if (showMore) {
      return env;
    }
    return env.slice(0, 3);
  };

  /**
   * handleMainYAMLChange funtion makes the changes
   * in the engine YAML and then adds the engine manifest
   * to the overall workflow YAML
   */
  const handleMainYAMLChange = () => {
    engineYAML.spec.experiments[0].spec.components.env = env;
    const mainManifest = YAML.parse(manifest.manifest);
    mainManifest.spec.templates[engineIndex].inputs.artifacts[0].raw.data =
      YAML.stringify(engineYAML);
    workflow.setWorkflowManifest({
      manifest: YAML.stringify(mainManifest),
      engineYAML: YAML.stringify(engineYAML),
    });
    closeStepper();
  };

  return (
    <div data-cy="TuneExperiment">
      <Typography>{t('createWorkflow.tuneWorkflow.env.envHeading')}</Typography>
      <br />
      <div className={classes.inputDiv}>
        {getShowMoreItems(env).map((data, index) => {
          return (
            <>
              <InputField
                width="auto"
                label={data.name}
                value={env[index].value}
                onChange={(event) => {
                  env[index].value = event.target.value;
                  setEnvs([...env]);
                }}
                data-cy={data.name}
              />
              <br />
            </>
          );
        })}
        <div>
          {env.length > 3 && !showMore ? (
            <ButtonFilled
              className={classes.showMoreBtn}
              onClick={() => {
                setShowMore(true);
              }}
              data-cy="ShowMoreEnv"
            >
              <ArrowDownwardIcon />
              <Typography>
                {t('createWorkflow.tuneWorkflow.env.showMoreEnv')}
              </Typography>
            </ButtonFilled>
          ) : showMore ? (
            <ButtonFilled
              className={classes.showMoreBtn}
              onClick={() => {
                setShowMore(false);
              }}
              data-cy="ShowLessEnv"
            >
              <ArrowUpwardIcon />
              <Typography>
                {t('createWorkflow.tuneWorkflow.env.showLessEnv')}
              </Typography>
            </ButtonFilled>
          ) : (
            <></>
          )}
        </div>
        <div>
          <Typography className={classes.keyText}>
            {t('createWorkflow.tuneWorkflow.env.key')}
          </Typography>
          <br />
          <div style={{ display: 'flex' }}>
            <InputField
              label="Add Key"
              value={addEnv.name}
              onChange={(event) => {
                setAddEnv({
                  ...addEnv,
                  name: event.target.value,
                });
              }}
              width="20"
              className={classes.addKeyInput}
              data-cy="AddKey"
            />
            <InputField
              label="Add Value"
              value={addEnv.value}
              onChange={(event) => {
                setAddEnv({
                  ...addEnv,
                  value: event.target.value,
                });
              }}
              width="20"
              data-cy="AddValue"
            />
          </div>
          <ButtonFilled
            className={classes.addKeyValue}
            onClick={() => {
              env[env.length] = {
                name: addEnv.name,
                value: addEnv.value,
              };
              setEnvs(env);
              setAddEnv({
                name: '',
                value: '',
              });
            }}
            disabled={addEnv.name.trim() === '' || addEnv.value.trim() === ''}
          >
            <AddIcon /> {t('createWorkflow.tuneWorkflow.env.addKey')}
          </ButtonFilled>
        </div>
      </div>

      <div data-cy="TuneExperimentControlButtons">
        <Button onClick={() => gotoStep(2)} className={classes.button}>
          {t('workflowStepper.back')}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => handleMainYAMLChange()}
          className={classes.button}
        >
          {t('createWorkflow.tuneWorkflow.env.finish')}
        </Button>
      </div>
    </div>
  );
};

export default EnvironmentVariables;
