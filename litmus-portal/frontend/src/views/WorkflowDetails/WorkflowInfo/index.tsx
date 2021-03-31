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
    <div
      className={`${classes.root} ${
        tab === 1 ? classes.rootBottom : classes.rootHeader
      }`}
    >
      {/* Workflow Information */}

      {/* Header Section */}
      <Typography className={classes.header}>
        <strong>{t('workflowDetailsView.workflowInfo.header')}</strong>
      </Typography>

      {/* Body Section divided in 4 parts */}
      <div className={classes.section}>
        {/* 1. Resiliency Score Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.resilienceScore')}
          </Typography>
          {/* Static data, will be changed with API response */}
          <Typography className={classes.resilliencyScore}>100%</Typography>
        </div>

        {/* 2. Run Time Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.runTime.runTimeHeader')}
          </Typography>
          <div className={classes.section}>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.runTime.startTime')}
              </Typography>
              <Typography>{timeDifference(data.startedAt)}</Typography>
            </div>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
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

        {/* 3. HostedOn Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.hostedOn.hostedOnHeader')}
          </Typography>
          <div className={classes.section}>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.hostedOn.cluster')}
              </Typography>
              <Typography>{cluster_name}</Typography>
            </div>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.hostedOn.namespace')}
              </Typography>
              <Typography>{data.namespace}</Typography>
            </div>
          </div>
        </div>

        {/* Target Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.targets.targetsHeader')}
          </Typography>
          <div className={classes.section}>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.targets.cluster')}
              </Typography>
              <div>{cluster_name}</div>
            </div>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.targets.namespace')}
              </Typography>
              <Typography>{data.namespace}</Typography>
            </div>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.application')}
              </Typography>

              {/* Static data, will be changed with API response */}
              <Typography>Application name</Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
