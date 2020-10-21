import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@material-ui/core';
import React from 'react';
import Scaffold from '../../../containers/layouts/Scaffold';
import useStyles from './styles';
import { LocationState } from '../../../models/routerModel';

interface LocationObjectProps {
  data: any;
}

interface MyHubChartProps {
  location: LocationState<LocationObjectProps>;
}

const MyHub: React.FC<MyHubChartProps> = ({ location }) => {
  const data: any = location.state;
  const classes = useStyles();
  return (
    <Scaffold>
      <div className={classes.header}>
        <Typography variant="h3" gutterBottom>
          My Hub
        </Typography>
        <Typography variant="h4">
          <strong>github.com/</strong>
        </Typography>
      </div>
      <div className={classes.mainDiv}>
        <div className={classes.detailsDiv}>
          <div className={classes.chartsGroup}>
            {data.map((hub: any) => {
              return hub.Spec.Experiments.map((expName: any) => {
                return (
                  <Card elevation={3} className={classes.cardDiv}>
                    <CardActionArea>
                      <CardContent className={classes.cardContent}>
                        {/* <img
                          src="{https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/cassandra/icons/cassandra-pod-delete.png}"
                          alt="add-hub"
                        /> */}
                        <Typography variant="h6" align="center">
                          {hub.Spec.DisplayName}/
                        </Typography>

                        <Typography variant="h6" align="center">
                          {expName}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              });
            })}
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default MyHub;
