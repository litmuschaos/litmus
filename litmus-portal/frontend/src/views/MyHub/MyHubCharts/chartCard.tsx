import { Card, CardContent, Link, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import useStyles from './styles';
import { history } from '../../../redux/configureStore';
import { HubDetails } from '../../../models/redux/myhub';
import config from '../../../config';

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

interface ChartCardProps {
  expName: ChartName;
  UserHub: HubDetails | undefined;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  projectID: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  expName,
  UserHub,
  setSearch,
  projectID,
}) => {
  const classes = useStyles();
  const experimentDefaultImagePath = `${config.grahqlEndpoint}/icon`;

  const [imageURL, setImageURL] = useState(
    `${experimentDefaultImagePath}/${projectID}/${UserHub?.HubName}/${expName.ChaosName}/${expName.ExperimentName}.png`
  );

  return (
    <div>
      <Card
        key={expName.ExperimentName}
        elevation={3}
        className={classes.cardDiv}
        onClick={() =>
          history.push(
            `${UserHub?.HubName}/${expName.ChaosName}/${expName.ExperimentName}`
          )
        }
      >
        <CardContent className={classes.cardContent}>
          <img
            src={imageURL}
            onError={() => setImageURL('/icons/default-experiment.svg')}
            alt={expName.ExperimentName}
            className={classes.cardImage}
          />
          <Link
            href="#"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              setSearch(expName.ChaosName);
            }}
            className={classes.categoryName}
          >
            {expName.ChaosName}/
          </Link>
          <Typography className={classes.expName} variant="h6" align="center">
            {expName.ExperimentName}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};
export default ChartCard;
