import {
  AccordionDetails,
  RadioGroup,
  Typography,
  useTheme,
} from '@material-ui/core';
import { LitmusCard, RadioButton, Search } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import data from '../../../components/PredifinedWorkflows/data';
import { preDefinedWorkflowData } from '../../../models/predefinedWorkflow';
import useStyles from './styles';

interface ChooseWorkflowRadio {
  selected: string;
  id: string;
}

const ChoosePreDefinedExperiments = () => {
  const classes = useStyles();
  const { palette } = useTheme();

  // Local States
  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');

  // Methods
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
    const selection: ChooseWorkflowRadio = {
      selected: 'A',
      id: event.target.value,
    };
    localforage.setItem('selectedScheduleOption', selection);
    localforage.setItem('hasSetWorkflowData', false);
  };

  const filteredPreDefinedWorkflows = data.filter(
    (w: preDefinedWorkflowData) => {
      if (search === null) return w;
      if (w.title.toLowerCase().includes(search.toLowerCase())) return w;
      return null;
    }
  );

  // Selects Option A -> Sub Experiment Options which was already selected by the user
  useEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then((value) =>
        value !== null
          ? setSelected((value as ChooseWorkflowRadio).id)
          : setSelected('')
      );
  }, []);

  return (
    <AccordionDetails>
      {/* Wrapping content inside the Accordion to take full width */}
      <div style={{ width: '100%' }}>
        <Search
          data-cy="agentSearch"
          id="input-with-icon-textfield"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {/* Leaving some space between the search and pre-defined workflow cards */}
        <br />
        <br />

        {/* List of Pre-defined workflows */}
        <div className={classes.predefinedWorkflowDiv}>
          <RadioGroup value={selected} onChange={handleChange}>
            {filteredPreDefinedWorkflows.map((workflowData) => (
              <LitmusCard
                width="100%"
                height="5rem"
                key={workflowData.workflowID}
                borderColor={palette.border.main}
                className={classes.predefinedWorkflowCard}
              >
                <RadioButton value={workflowData.workflowID.toString()}>
                  {/* Wrap the entire body with 100% width to divide into 40-60 */}
                  <div id="body">
                    {/* Left Div => Icon + Name of Workflow */}
                    <div id="left-div">
                      <img
                        className={classes.experimentIcon}
                        src={workflowData.urlToIcon}
                        alt="Experiment Icon"
                      />
                      <Typography className={classes.predefinedWorkflowName}>
                        {workflowData.title}
                      </Typography>
                    </div>
                    {/* Right Div => Description of Workflow */}
                    <div id="right-div">
                      <Typography>{workflowData.description}</Typography>
                    </div>
                  </div>
                </RadioButton>
              </LitmusCard>
            ))}
          </RadioGroup>
        </div>
        {/* Bottom Blur */}
        <div className={classes.blur} />
      </div>
    </AccordionDetails>
  );
};
export default ChoosePreDefinedExperiments;
