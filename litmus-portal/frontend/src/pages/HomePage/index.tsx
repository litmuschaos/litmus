import { Card, CardActionArea, Typography } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import { useHistory } from 'react-router-dom';
import CustomInfoFilled from '../../components/InfoFilled/index';
import QuickActionCard from '../../components/QuickActionCard';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './style';

function CreateWorkflowCard() {
  const classes = useStyles();
  const history = useHistory();

  const routeChange = () => {
    const path = `/workflow`;
    history.push(path);
  };
  return (
    <Card
      elevation={3}
      className={classes.createWorkflowCard}
      onClick={() => {
        routeChange();
      }}
    >
      <CardActionArea>
        <Typography className={classes.createWorkflowHeading}>
          Let&#39;s Start
        </Typography>
        <Typography className={classes.createWorkflowTitle}>
          Schedule your first workflow
        </Typography>
        <ArrowForwardIcon className={classes.arrowForwardIcon} />
      </CardActionArea>
    </Card>
  );
}

const HomePage = () => {
  const userName = 'Richard Hill';
  const classes = useStyles();
  return (
    <Scaffold>
      <div className={classes.rootContainer}>
        <div className={classes.root}>
          <Typography className={classes.userName}>
            Welcome, <strong>{userName}</strong>
          </Typography>
          <div className={classes.headingDiv}>
            <div style={{ width: '65%' }}>
              <div className={classes.mainDiv}>
                <Typography className={classes.mainHeading}>
                  <strong>Congratulations!</strong>
                </Typography>
                <Typography className={classes.mainResult}>
                  <strong>
                    You have established your own first project on Litmus
                    portal.{' '}
                  </strong>
                </Typography>
                <Typography className={classes.mainDesc}>
                  Now this is successfully running on your Kubernetes cluster.
                  Once you schedule chaos workflows, reliability analytics are
                  displayed here.
                </Typography>
              </div>
            </div>
            <div className={classes.createWorkflow}>
              <CreateWorkflowCard />
            </div>
          </div>
          <div className={classes.contentDiv}>
            <div className={classes.statDiv}>
              <Typography className={classes.statsHeading}>
                <strong>How busy Litmus Project is?</strong>
              </Typography>
              <div className={classes.cardDiv}>
                <CustomInfoFilled
                  color="#109B67"
                  value={11.2}
                  statType="Operator Installed"
                />
                <CustomInfoFilled
                  color="#858CDD"
                  value={29}
                  plus
                  statType="Total Experiments"
                />
                <CustomInfoFilled
                  color="#F6B92B"
                  value={60}
                  plus
                  statType="Total Runs Experiments"
                />
                <CustomInfoFilled
                  color="#BA3B34"
                  value={800}
                  plus
                  statType="Github Stars"
                />
              </div>
            </div>
            <div className={classes.quickActionDiv}>
              <QuickActionCard />
            </div>
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default HomePage;
