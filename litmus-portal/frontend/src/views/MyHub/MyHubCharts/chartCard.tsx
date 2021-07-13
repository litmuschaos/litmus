import { Card, CardContent, Link, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import config from '../../../config';
import { HubDetails } from '../../../models/redux/myhub';
import { history } from '../../../redux/configureStore';
import useStyles from './styles';

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

interface ChartCardProps {
  expName: ChartName;
  UserHub: HubDetails | undefined;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  projectID: string;
  userRole: string;
  isPredefined?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  expName,
  UserHub,
  setSearch,
  projectID,
  userRole,
  isPredefined,
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
        onClick={() => {
          history.push({
            pathname: `${UserHub?.HubName}/${expName.ChaosName}/${expName.ExperimentName}`,
            search: `?projectID=${projectID}&projectRole=${userRole}`,
          });
        }}
      >
        <CardContent className={classes.cardContent}>
          <img
            src={imageURL}
            onError={() => setImageURL('./icons/default-experiment.svg')}
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
            {!isPredefined && `${expName.ChaosName}/`}
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
