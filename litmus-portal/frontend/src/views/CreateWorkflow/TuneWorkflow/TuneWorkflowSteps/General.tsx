import { Button, Typography } from '@material-ui/core';
import { InputField } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { ChooseWorkflowRadio } from '../../../../models/localforage/radioButton';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { RootState } from '../../../../redux/reducers';
import useStyles from './styles';

interface GeneralProps {
  gotoStep: (page: number) => void;
  isCustom: boolean | undefined;
}

const General: React.FC<GeneralProps> = ({ gotoStep, isCustom }) => {
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
    engineYAML.metadata.generateName
  );
  const getContext = () => {
    let context = '';
    if (
      engineYAML.metadata.labels !== undefined &&
      engineYAML.metadata.labels.context !== undefined
    ) {
      return engineYAML.metadata.labels.context;
    }

    context = `${experimentName}_${namespace}`;
    return context;
  };

  useEffect(() => {
    getContext();
  });
  const [context, setContext] = React.useState<string>(getContext());
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
    parsedYAML.metadata.generateName = experimentName;
    if (parsedYAML.metadata.labels) {
      parsedYAML.metadata.labels['context'] = context;
    } else {
      parsedYAML.metadata['labels'] = {
        context,
      };
    }
    workflow.setWorkflowManifest({
      engineYAML: YAML.stringify(parsedYAML),
    });
    gotoStep(1);
  };

  return (
    <div data-cy="General">
      <Typography>
        {t('createWorkflow.tuneWorkflow.verticalStepper.myHubInfo')}
      </Typography>
      <br />
      <div className={classes.generalContainer}>
        {isCustom && (
          <>
            {hubName.length > 0 && (
              <>
                <InputField
                  label="ChaosHub"
                  value={hubName}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                  data-cy="HubName"
                />
                <br />
              </>
            )}
            <InputField
              label="Chaos Experiment Name"
              value={experimentName}
              onChange={(e) => {
                setExperimentName(e.target.value);
              }}
              data-cy="ExperimentName"
            />
            <br />
          </>
        )}
        <InputField
          label="Context"
          value={context}
          onChange={(e) => {
            setContext(e.target.value);
          }}
          data-cy="Context"
        />
      </div>
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={handleNext}
        className={classes.button}
        data-cy="GeneralNext"
      >
        {t('workflowStepper.next')}
      </Button>
    </div>
  );
};

export default General;
