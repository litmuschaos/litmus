import { Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExecutionData } from '../../../models/graphql/workflowData';
import WorkflowStatusText from '../WorkflowStatus/statusText';
import useStyles from './styles';

interface WorkflowInfoProps {
  setIsInfoToggled?: React.Dispatch<React.SetStateAction<boolean>>;
  tab: number;
  data: ExecutionData;
  workflowPhase: string;
  resiliencyScore?: number;
  clusterName: string;
}

const WorkflowInfo: React.FC<WorkflowInfoProps> = ({
  setIsInfoToggled,
  tab,
  data,
  workflowPhase,
  resiliencyScore,
  clusterName,
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
            {resiliencyScore === undefined || resiliencyScore === null
              ? 'NA'
              : `${resiliencyScore}%`}
          </Typography>
        </div>

        {/* 2. Workflow Status Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.status')}
          </Typography>
          <WorkflowStatusText phase={workflowPhase} />
        </div>

        {/* 3. Run Time Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.runTime.duration')}
          </Typography>
          <Typography style={{ fontSize: '1rem' }}>
            {data.finishedAt !== ''
              ? (
                  (parseInt(data.finishedAt, 10) -
                    parseInt(data.startedAt, 10)) /
                  60
                ).toFixed(1)
              : (
                  (new Date().getTime() / 1000 - parseInt(data.startedAt, 10)) /
                  60
                ).toFixed(1)}
            &nbsp;
            {t('workflowDetailsView.tableView.minutes')}
          </Typography>
        </div>

        {/* 4. Target Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.targets.targetsHeader')}
          </Typography>
          <div>
            <Typography className={classes.subCategorySectionText}>
              {clusterName}
            </Typography>
          </div>
        </div>
        <div>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.targets.namespace')}
          </Typography>
          <Typography
            data-cy="workflowNamespace"
            className={classes.subCategorySectionText}
          >
            {data.namespace}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default WorkflowInfo;
