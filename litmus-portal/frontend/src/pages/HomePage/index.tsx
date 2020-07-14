import { Card, CardActionArea, Typography, Button } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import InfoFilled from '../../components/InfoFilled/index';
import QuickActionCard from '../../components/QuickActionCard';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './style';
import { RootState } from '../../redux/reducers';
import WelcomeModal from '../../components/WelcomeModal';

const CreateWorkflowCard = () => {
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
      data-cy="createWorkflow"
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
};

interface CardValueData {
  color: string;
  value: number;
  statType: string;
  plus?: boolean | undefined;
}

const HomePage = () => {
  const { communityData, userData } = useSelector((state: RootState) => state);
  const cardData: CardValueData[] = [
    {
      color: '#109B67',
      value: parseInt(communityData.google.operatorInstalls, 10),
      statType: 'Operator Installed',
      plus: true,
    },
    {
      color: '#858CDD',
      value: parseInt(communityData.google.totalRuns, 10),
      statType: 'Total Experiment Runs',
      plus: true,
    },
    {
      color: '#F6B92B',
      value: parseInt(communityData.github.experimentsCount, 10),
      statType: 'Total Experiments',
    },
    {
      color: '#BA3B34',
      value: parseInt(communityData.github.stars, 10),
      statType: 'Github Stars',
    },
  ];
  const { name } = userData;
  const classes = useStyles();
  if (userData.email === '') return <WelcomeModal />;
  return (
    <Scaffold>
      <div className={classes.rootContainer}>
        <div className={classes.root}>
          <Typography className={classes.userName}>
            Welcome, <strong>{name}</strong>
          </Typography>
          <div className={classes.headingDiv}>
            <div className={classes.mainDiv}>
              <div>
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

                <Button variant="contained" className={classes.predefinedBtn}>
                  <Typography variant="subtitle1">
                    See pre-defined workflows
                  </Typography>
                </Button>
              </div>
              <div className={classes.imageDiv}>
                <img src="icons/applause.png" alt="Applause icon" />
              </div>
            </div>
            <div>
              <CreateWorkflowCard data-cy="CreateWorkflowCard" />
            </div>
          </div>
          <div className={classes.contentDiv}>
            <div className={classes.statDiv}>
              <div className={classes.btnHeaderDiv}>
                <Typography className={classes.statsHeading}>
                  <strong>How busy Litmus Project is?</strong>
                </Typography>
                <Button className={classes.seeAllBtn}>
                  <div className={classes.btnSpan}>
                    <Typography className={classes.btnText}>
                      See more
                    </Typography>
                    <img src="icons/next.png" alt="next" />
                  </div>
                </Button>
              </div>
              <div className={classes.cardDiv}>
                {cardData.map((data) => (
                  <InfoFilled
                    color={data.color}
                    value={data.value}
                    statType={data.statType}
                    plus={data.plus}
                  />
                ))}
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
