import { Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreateWorkflowCard } from '../../components/CreateWorkflowCard';
import InfoFilledWrap from '../../components/InfoFilled';
import QuickActionCard from '../../components/QuickActionCard';
import Scaffold from '../../containers/layouts/Scaffold';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';
import { getUserDetailsFromJwt } from '../../utils/auth';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import WelcomeModal from '../../views/Home/WelcomeModal';
import useStyles from './style';

const HomePage: React.FC = () => {
  const userData = getUserDetailsFromJwt();
  const classes = useStyles();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);
  const projectID = getProjectID();
  const userRole = getProjectRole();

  const handleModal = () => {
    window.location.reload();
  };

  return (
    <Scaffold>
      {!projectID && <WelcomeModal handleIsOpen={handleModal} />}
      <div className={classes.rootContainer}>
        <div>
          <Typography variant="h3" className={classes.userName}>
            {t('home.heading')}
            <strong>{` ${userData.username}`}</strong>
          </Typography>
          <div className={classes.headingDiv}>
            <div className={classes.mainDiv}>
              <div>
                <Typography className={classes.mainHeading}>
                  <strong>{t('home.subHeading1')}</strong>
                </Typography>
                <Typography className={classes.mainResult}>
                  <strong>{t('home.subHeading2')}</strong>
                </Typography>
                <Typography className={classes.mainDesc}>
                  {t('home.subHeading3')}
                </Typography>
                <div className={classes.predefinedBtn}>
                  <ButtonFilled
                    variant="success"
                    onClick={() => {
                      tabs.changeWorkflowsTabs(2);
                      history.push({
                        pathname: '/workflows',
                        search: `?projectID=${projectID}&projectRole=${userRole}`,
                      });
                    }}
                  >
                    <Typography variant="subtitle1">
                      {t('home.button1')}
                    </Typography>
                  </ButtonFilled>
                </div>
              </div>
              <div className={classes.imageDiv}>
                <img src="icons/applause.png" alt="Applause icon" />
              </div>
            </div>
            <div>
              <CreateWorkflowCard isDisabled data-cy="CreateWorkflowCard" />
            </div>
          </div>
          <div className={classes.contentDiv}>
            <div className={classes.statDiv}>
              <div className={classes.btnHeaderDiv}>
                <Typography className={classes.statsHeading}>
                  <strong>{t('home.analytics.heading')}</strong>
                </Typography>
                <IconButton
                  className={classes.seeAllBtn}
                  onClick={(event) => {
                    event.preventDefault();
                    history.push({
                      pathname: '/community',
                      search: `?projectID=${projectID}&projectRole=${userRole}`,
                    });
                  }}
                >
                  <div className={classes.btnSpan}>
                    <Typography className={classes.btnText}>
                      {t('home.analytics.moreInfo')}
                    </Typography>
                    <img src="icons/next.png" alt="next" />
                  </div>
                </IconButton>
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
