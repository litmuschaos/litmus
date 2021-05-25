import { Typography } from '@material-ui/core';
import React from 'react';
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
            Last Configured : 2 minutes ago
          </Typography>
        </div>
      </div>
      {/* //TestNet: */}
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
            Last Configured : 2 minutes ago
          </Typography>
        </div>
      </div>
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
            Last Configured : 2 minutes ago
          </Typography>
        </div>
      </div>
    </>
  );
};

export { OverviewCard };
