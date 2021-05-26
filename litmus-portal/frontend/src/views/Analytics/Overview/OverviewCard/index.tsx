import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import { ReactComponent as AnalyticsIcon } from '../../../../svg/analytics.svg';
import { ReactComponent as CogwheelIcon } from '../../../../svg/cogwheel.svg';
import { ReactComponent as DownloadIcon } from '../../../../svg/download.svg';
import useStyles from './styles';

const OverviewCard: React.FC = () => {
  //   const { t } = useTranslation();
  const classes = useStyles();

  //   const projectID = getProjectID();
  //   const projectRole = getProjectRole();

  return (
    <>
      <div className={classes.animatedContainer}>
        <div className={classes.workflowDataContainer}>
          <div>
            <div className={classes.statusDiv}>
              <img src="./icons/kubernetes-platform.svg" alt="k8s" />
              <div>
                <Typography
                  className={`${classes.testName} ${classes.noWrapProvider}`}
                >
                  Kubernetes Platform
                </Typography>
                <Typography className={classes.hint}>
                  Agent: Self Agent
                </Typography>
              </div>
            </div>
          </div>
          <Typography className={`${classes.noWrapProvider} ${classes.hint}`}>
            2 minutes ago
          </Typography>
          <section className={classes.cardActionsSection}>
            <div className={classes.cardActions}>
              <IconButton>
                <AnalyticsIcon />
              </IconButton>
              <Typography>Analytics</Typography>
            </div>
            <div className={classes.cardActions}>
              <IconButton>
                <CogwheelIcon />
              </IconButton>
              <Typography>Configure</Typography>
            </div>
            <div className={classes.cardActions}>
              <IconButton>
                <DownloadIcon />
              </IconButton>
              <Typography>JSON</Typography>
            </div>
          </section>
        </div>
      </div>
      {/* //TestNet: */}
    </>
  );
};

export { OverviewCard };
