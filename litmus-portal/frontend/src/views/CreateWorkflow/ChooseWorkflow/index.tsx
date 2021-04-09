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
  useRef,
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
  const childRef = useRef<ChildRef>();
  const [selected, setSelected] = useState<string>('');
  const workflowDetails = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );
  const workflowAction = useActions(WorkflowActions);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
    if (event.target.value === 'C') {
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
    if (childRef.current) {
      alert.changeAlertState(true);
      return childRef.current.onNext();
    }
    alert.changeAlertState(false);
    return true;
  }

  useEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then((value) =>
        value
          ? setSelected((value as ChooseWorkflowRadio).selected)
          : setSelected('')
      );
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
          aria-label="gender"
          name="gender1"
          value={selected}
          onChange={handleChange}
        >
          <Accordion expanded={selected === 'A'} className={classes.accordion}>
            <AccordionSummary>
              <RadioButton value="A" onChange={(e) => handleChange(e)}>
                {t('createWorkflow.chooseWorkflow.optionA')}
              </RadioButton>
            </AccordionSummary>
            <ChoosePreDefinedExperiments ref={childRef} />
          </Accordion>

          <RadioButton value="B" onChange={(e) => handleChange(e)}>
            {t('createWorkflow.chooseWorkflow.optionB')}
          </RadioButton>

          <Accordion
            expanded={selected === 'C'}
            classes={{
              root: classes.MuiAccordionroot,
            }}
            className={classes.accordion}
          >
            <AccordionSummary>
              <RadioButton value="C" onChange={(e) => handleChange(e)}>
                {t('createWorkflow.chooseWorkflow.optionC')}
                <span className={classes.bold}>
                  {t('createWorkflow.chooseWorkflow.myHubs')}
                </span>
              </RadioButton>
            </AccordionSummary>
            <SelectMyHub ref={childRef} />
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
                {t('createWorkflow.chooseWorkflow.optionD')}
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
