import { Typography } from '@material-ui/core';
import React from 'react';
import AdjustedWeight from '../../../components/AdjustedWeights';
import useStyles from './styles';

interface ExperimentDetailsProps {
  testNames: string[];
  testWeights: number[];
  experimentInfo?: string;
}

const ExperimentDetails: React.FC<ExperimentDetailsProps> = ({
  testNames,
  testWeights,
  experimentInfo,
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
                <Typography>{experimentInfo}</Typography>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ExperimentDetails;
