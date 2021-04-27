import { Button, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { InputField } from 'litmus-ui';
import localforage from 'localforage';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { ChooseWorkflowRadio } from '../../../../models/localforage/radioButton';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import useActions from '../../../../redux/actions';
import { RootState } from '../../../../redux/reducers';

interface GeneralProps {
  gotoStep: (page: number) => void;
}

const General: React.FC<GeneralProps> = ({ gotoStep }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [hubName, setHubName] = React.useState<string>('');
  const workflow = useActions(WorkflowActions);
  const engine = useSelector(
    (state: RootState) => state.workflowManifest.engineYAML
  );
  const namespace = useSelector(
    (state: RootState) => state.workflowData.namespace
  );
  const engineYAML = YAML.parse(engine);
  const [experimentName, setExperimentName] = React.useState<string>(
    engineYAML.metadata.name
  );
  const [context, setContext] = React.useState<string>(
    engineYAML.metadata.labels !== undefined &&
      engineYAML.metadata.labels.context !== undefined
      ? engineYAML.metadata.labels.context
      : `${namespace}-${experimentName}`
  );
  useEffect(() => {
    localforage.getItem('selectedScheduleOption').then((value) => {
      if (value !== null && (value as ChooseWorkflowRadio).selected === 'C') {
        localforage.getItem('selectedHub').then((hub) => {
          setHubName(hub as string);
        });
      }
    });
  }, []);

  const handleNext = () => {
    const parsedYAML = YAML.parse(engine);
    parsedYAML.metadata.name = experimentName;
    parsedYAML.metadata['labels'] = {
      context,
    };
    workflow.setWorkflowManifest({
      engineYAML: YAML.stringify(parsedYAML),
    });
    gotoStep(1);
  };

  return (
    <div>
      <Typography>
        {t('createWorkflow.tuneWorkflow.verticalStepper.myHubInfo')}
      </Typography>
      <br />
      <div className={classes.generalContainer}>
        <InputField
          label="Hub"
          value={hubName}
          InputProps={{
            readOnly: true,
          }}
        />
        <br />
        <InputField
          label="Experiment Name"
          value={experimentName}
          onChange={(e) => {
            setExperimentName(e.target.value);
          }}
        />
        <br />
        <InputField
          label="Context"
          value={context}
          onChange={(e) => {
            setContext(e.target.value);
          }}
        />
      </div>
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={handleNext}
        className={classes.button}
      >
        {t('workflowStepper.next')}
      </Button>
    </div>
  );
};

export default General;
