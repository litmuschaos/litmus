import { Button, Card, CardActionArea, Typography } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import InfoFilledWrap from '../../components/InfoFilled';
import QuickActionCard from '../../components/QuickActionCard';
import WelcomeModal from '../../components/WelcomeModal';
import Scaffold from '../../containers/layouts/Scaffold';
import { RootState } from '../../redux/reducers';
import useStyles from './style';

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

const HomePage = () => {
  const { userData } = useSelector((state: RootState) => state);
  const { name } = userData;
  const classes = useStyles();
  if (userData.email === '') {
    return <WelcomeModal isOpen />;
  }
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
                    portal.
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
                <InfoFilledWrap />
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
