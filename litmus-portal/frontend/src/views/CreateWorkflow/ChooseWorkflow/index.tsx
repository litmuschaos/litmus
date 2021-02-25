import {
  Accordion,
  AccordionSummary,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { RadioButton } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChoosePreDefinedExperiments from './choosePreDefinedExperiments';
import useStyles from './styles';
import UploadYAML from './uploadYAML';

interface ChooseWorkflowRadio {
  selected: string;
  id?: string;
}

const ChooseWorkflow: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [selected, setSelected] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
  };

  useEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then((value) =>
        value
          ? setSelected((value as ChooseWorkflowRadio).selected)
          : setSelected('')
      );
  }, []);

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
};

export default ChooseWorkflow;
