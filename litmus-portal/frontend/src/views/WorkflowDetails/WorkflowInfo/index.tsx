import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExecutionData } from '../../../models/graphql/workflowData';
import timeDifference from '../../../utils/datesModifier';
import useStyles from './styles';

interface WorkflowInfoProps {
  tab: number;
  data: ExecutionData;
  cluster_name: string;
}

const WorkflowInfo: React.FC<WorkflowInfoProps> = ({
  tab,
  data,
  cluster_name,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={tab === 1 ? classes.rootLight : classes.rootHeader}>
      {/* Workflow Information */}
      <Typography className={classes.descTextBold}>
        {t('workflowDetailsView.workflowInfo.header')}
      </Typography>
      <div className={classes.headerFlex}>
        <div className={classes.headerItemFlex}>
          <Typography className={classes.textBold}>
            {t('workflowDetailsView.workflowInfo.resilienceScore')}
          </Typography>
          <Typography className={classes.resilliencyScore}>100%</Typography>
        </div>
        <div className={classes.headerItemFlex}>
          <Typography className={classes.textBold}>
            {t('workflowDetailsView.workflowInfo.runTime.runTimeHeader')}
          </Typography>
          <div className={classes.headerFlex}>
            <div className={classes.headerMiniItemFlex}>
              <Typography className={classes.headerMiniItemText}>
                {t('workflowDetailsView.workflowInfo.runTime.startTime')}
              </Typography>
              <Typography>{timeDifference(data.startedAt)}</Typography>
            </div>
            <div className={classes.headerMiniItemFlex}>
              <Typography className={classes.headerMiniItemText}>
                {t('workflowDetailsView.workflowInfo.runTime.endTime')}
              </Typography>
              <Typography>
                {data.finishedAt !== ''
                  ? timeDifference(data.finishedAt)
                  : 'Not yet finished'}
              </Typography>
            </div>
          </div>
        </div>
        <div className={classes.headerItemFlex}>
          <Typography className={classes.textBold}>
            {t('workflowDetailsView.workflowInfo.hostedOn.hostedOnHeader')}
          </Typography>
          <div className={classes.headerFlex}>
            <div className={classes.headerMiniItemFlex}>
              <Typography className={classes.headerMiniItemText}>
                {t('workflowDetailsView.workflowInfo.hostedOn.cluster')}
              </Typography>
              <Typography>{cluster_name}</Typography>
            </div>
            <div className={classes.headerMiniItemFlex}>
              <Typography className={classes.headerMiniItemText}>
                {t('workflowDetailsView.workflowInfo.hostedOn.namespace')}
              </Typography>
              <Typography>{data.namespace}</Typography>
            </div>
          </div>
        </div>
        <div className={classes.headerItemFlex}>
          <Typography className={classes.textBold}>
            {t('workflowDetailsView.workflowInfo.targets.targetsHeader')}
          </Typography>
          <div className={classes.headerFlex}>
            <div className={classes.headerMiniItemFlex}>
              <Typography className={classes.headerMiniItemText}>
                {t('workflowDetailsView.workflowInfo.targets.cluster')}
              </Typography>
              <div>{cluster_name}</div>
            </div>
            <div className={classes.headerMiniItemFlex}>
              <Typography className={classes.headerMiniItemText}>
                {t('workflowDetailsView.workflowInfo.targets.namespace')}
              </Typography>
              <Typography>{data.namespace}</Typography>
            </div>
            <div className={classes.headerMiniItemFlex}>
              <Typography className={classes.headerMiniItemText}>
                {t('workflowDetailsView.workflowInfo.application')}
              </Typography>
              <Typography>Application name</Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
