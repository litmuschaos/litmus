import { Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TimePopOver from '../../../components/TimePopOver';
import { ExecutionData } from '../../../models/graphql/workflowData';
import WorkflowStatusText from '../WorkflowStatus/statusText';
import useStyles from './styles';

interface WorkflowInfoProps {
  setIsInfoToggled?: React.Dispatch<React.SetStateAction<boolean>>;
  tab: number;
  data: ExecutionData;
  workflow_phase: string;
  resiliency_score?: number;
  cluster_name: string;
}

const WorkflowInfo: React.FC<WorkflowInfoProps> = ({
  setIsInfoToggled,
  tab,
  data,
  workflow_phase,
  resiliency_score,
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
      <div className={classes.header}>
        <Typography className={classes.title}>
          <strong>{t('workflowDetailsView.workflowInfo.header')}</strong>
        </Typography>
        {tab === 1 && setIsInfoToggled && (
          <ButtonOutlined
            className={classes.closeButton}
            onClick={() => {
              setIsInfoToggled(false);
            }}
          >
            &#x2715;
          </ButtonOutlined>
        )}
      </div>

      {/* Body Section divided in 4 parts */}
      <div className={classes.section}>
        {/* 1. Resiliency Score Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.resilienceScore')}
          </Typography>
          {/* Static data, will be changed with API response */}
          <Typography className={classes.resiliencyScore}>
            {resiliency_score === undefined || resiliency_score === null
              ? 'NA'
              : `${resiliency_score}%`}
          </Typography>
        </div>

        {/* 2. Workflow Status Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.status')}
          </Typography>
          <WorkflowStatusText phase={workflow_phase} />
        </div>

        {/* 3. Run Time Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.runTime.runTimeHeader')}
          </Typography>
          <div className={classes.section}>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.runTime.startTime')}
              </Typography>
              <TimePopOver unixTime={data.startedAt} />
            </div>
            <div className={classes.subCategorySection}>
              <Typography className={classes.subCategorySectionTitle}>
                {t('workflowDetailsView.workflowInfo.runTime.endTime')}
              </Typography>
              <Typography>
                {data.finishedAt !== '' ? (
                  <TimePopOver unixTime={data.finishedAt} />
                ) : (
                  'Not yet finished'
                )}
              </Typography>
            </div>
          </div>
        </div>

        {/* 4. Target Sub Section */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
