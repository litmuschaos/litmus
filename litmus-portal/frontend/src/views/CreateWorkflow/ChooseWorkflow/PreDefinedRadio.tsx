import { Typography } from '@material-ui/core';
import { RadioButton } from 'litmus-ui';
import React, { useState } from 'react';
import useStyles from './styles';

interface PreDefineRadioProps {
  workflowName: string;
  iconURL: string;
}

const PreDefinedRadio: React.FC<PreDefineRadioProps> = ({
  workflowName,
  iconURL,
}) => {
  const [icon, setIcon] = useState(iconURL);
  const classes = useStyles();
  return (
    <RadioButton value={workflowName}>
      {/* Wrap the entire body with 100% width to divide into 40-60 */}
      <div id="body">
        {/* Left Div => Icon + Name of Workflow */}
        <div id="left-div">
          <img
            className={classes.experimentIcon}
            src={icon}
            onError={() => setIcon('./icons/default-experiment.svg')}
            alt="Experiment Icon"
          />
          <Typography className={classes.predefinedWorkflowName}>
            {workflowName}
          </Typography>
        </div>
      </div>
    </RadioButton>
  );
};

export default PreDefinedRadio;
