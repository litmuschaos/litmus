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
import useActions from '../../../redux/actions';
import * as AlertActions from '../../../redux/actions/alert';
import ChoosePreDefinedExperiments from './choosePreDefinedExperiments';
import useStyles from './styles';
import UploadYAML from './uploadYAML';

interface ChooseWorkflowRadio {
  selected: string;
  id?: string;
}

const ChooseWorkflow = forwardRef((_, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const alert = useActions(AlertActions);

  const [selected, setSelected] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
  };

  function onNext() {
    if (selected === '') {
      alert.changeAlertState(true); // No Workflow Type has been selected and user clicked on Next
      return false;
    }
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
              <strong> {t('createWorkflow.chooseWorkflow.title')}</strong>
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
                Create a new workflow from one of the pre-defined chaos workflow
                templates
              </RadioButton>
            </AccordionSummary>
            <ChoosePreDefinedExperiments />
          </Accordion>

          <RadioButton value="B" onChange={(e) => handleChange(e)}>
            Create a new workflow by cloning an existing workflow
          </RadioButton>

          <RadioButton value="C" onChange={(e) => handleChange(e)}>
            Create a new workflow using the experiments from My Hubs
          </RadioButton>

          <Accordion expanded={selected === 'D'} className={classes.accordion}>
            <AccordionSummary>
              <RadioButton value="D" onChange={(e) => handleChange(e)}>
                Import a workflow using YAML
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
