import {
  Accordion,
  AccordionSummary,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { RadioButton } from 'litmus-ui';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import useActions from '../../../redux/actions';
import * as AlertActions from '../../../redux/actions/alert';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import ChoosePreDefinedExperiments from './choosePreDefinedExperiments';
import ChooseWorkflowFromExisting from './ChooseWorkflowFromExisting';
import SelectMyHub from './SelectMyHub';
import useStyles from './styles';
import UploadYAML from './uploadYAML';

interface ChildRef {
  onNext: () => void;
}

const ChooseWorkflow = forwardRef((_, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const alert = useActions(AlertActions);
  const [selected, setSelected] = useState<string>('');
  const workflowDetails = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );
  const workflowAction = useActions(WorkflowActions);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
    if (event.target.value === 'C' || event.target.value === 'D') {
      workflowAction.setWorkflowManifest({
        isCustomWorkflow: true,
      });
    } else {
      workflowAction.setWorkflowManifest({
        isCustomWorkflow: false,
      });
    }
  };

  function onNext() {
    if (selected === '') {
      alert.changeAlertState(true); // No Workflow Type has been selected and user clicked on Next
      return false;
    }
    if (selected === 'D' && workflowDetails === '') {
      alert.changeAlertState(true);
      return false;
    }
    alert.changeAlertState(false);
    return true;
  }

  useEffect(() => {
    localforage.getItem('selectedScheduleOption').then((value) => {
      if (value) {
        setSelected((value as ChooseWorkflowRadio).selected);
      } else setSelected('');
    });
    workflowAction.setWorkflowManifest({
      manifest: '',
    });
  }, []);

  useImperativeHandle(ref, () => ({
    onNext,
  }));

  return (
    <div className={classes.root}>
      <div className={classes.innerContainer}>
        {/* Header */}
        <div aria-label="header" className={classes.header}>
          <div aria-label="headerLeft">
            <Typography className={classes.title}>
              {t('createWorkflow.chooseWorkflow.title')}
            </Typography>
            <Typography className={classes.subtitle}>
              {t('createWorkflow.chooseWorkflow.subtitle')}
            </Typography>
          </div>
        </div>

        <hr className={classes.divider} />

        {/* Selection Radio Buttons */}
        <div className={classes.m5} />

        <RadioGroup
          data-testid="workflowRadioButtons"
          value={selected}
          onChange={handleChange}
        >
          <Accordion expanded={selected === 'A'} className={classes.accordion}>
            <AccordionSummary>
              <RadioButton value="A" onChange={(e) => handleChange(e)}>
                <span data-testid="option">
                  {t('createWorkflow.chooseWorkflow.optionA')}
                </span>
              </RadioButton>
            </AccordionSummary>
            <ChoosePreDefinedExperiments />
          </Accordion>

          <Accordion
            expanded={selected === 'B'}
            classes={{
              root: classes.MuiAccordionroot,
            }}
            className={classes.accordion}
          >
            <AccordionSummary>
              <RadioButton value="B" onChange={(e) => handleChange(e)}>
                <span data-testid="option">
                  {t('createWorkflow.chooseWorkflow.optionB')}
                </span>
              </RadioButton>
            </AccordionSummary>
            <ChooseWorkflowFromExisting />
          </Accordion>

          <Accordion
            expanded={selected === 'C'}
            classes={{
              root: classes.MuiAccordionroot,
            }}
            className={classes.accordion}
          >
            <AccordionSummary>
              <RadioButton value="C" onChange={(e) => handleChange(e)}>
                <span data-testid="option">
                  {t('createWorkflow.chooseWorkflow.optionC')}
                </span>
                <span className={classes.bold}>
                  {t('createWorkflow.chooseWorkflow.myHubs')}
                </span>
              </RadioButton>
            </AccordionSummary>
            <SelectMyHub />
          </Accordion>

          <Accordion
            expanded={selected === 'D'}
            classes={{
              root: classes.MuiAccordionroot,
            }}
            className={classes.accordion}
          >
            <AccordionSummary>
              <RadioButton value="D" onChange={(e) => handleChange(e)}>
                <span data-testid="option">
                  {t('createWorkflow.chooseWorkflow.optionD')}
                </span>
              </RadioButton>
            </AccordionSummary>
            <UploadYAML />
          </Accordion>
        </RadioGroup>
      </div>
    </div>
  );
});

export default ChooseWorkflow;
