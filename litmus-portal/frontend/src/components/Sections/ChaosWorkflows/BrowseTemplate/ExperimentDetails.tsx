import React from 'react';
import { Typography } from '@material-ui/core';
import AdjustedWeight from '../../../AdjustedWeights';
import useStyles from './styles';

interface ExperimentDetailsProps {
  testNames: string[];
  testWeights: number[];
}

const ExperimentDetails: React.FC<ExperimentDetailsProps> = ({
  testNames,
  testWeights,
}) => {
  const classes = useStyles();

  return (
    <div>
      <Typography className={classes.headerText}>
        Experiment details:
      </Typography>
      <div className={classes.experimentWrapperDiv}>
        {testNames &&
          testNames.map((test, i) => {
            // Mapping all the experiments from a selected workflow
            return (
              <div className={classes.tests}>
                <AdjustedWeight
                  testName={test}
                  testValue={testWeights[i]}
                  spacing
                  icon
                />
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Curabitur bibendum quis nisi nec interdum.
                </Typography>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ExperimentDetails;
