import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonOutlined } from 'litmus-ui';
import { ExecutionData } from '../../../models/graphql/workflowData';
import timeDifference from '../../../utils/datesModifier';
import useStyles from './styles';

interface WorkflowInfoProps {
  setIsInfoToggled?: React.Dispatch<React.SetStateAction<boolean>>;
  tab: number;
  data: ExecutionData;
  cluster_name: string;
}

const WorkflowInfo: React.FC<WorkflowInfoProps> = ({
  setIsInfoToggled,
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

      {/* Body Section divided in 3 parts */}
      <div className={classes.section}>
        {/* 1. Resiliency Score Sub Section */}
        <div className={classes.subSection}>
          <Typography className={classes.subSectionTitle}>
            {t('workflowDetailsView.workflowInfo.resilienceScore')}
          </Typography>
          {/* Static data, will be changed with API response */}
          <Typography className={classes.resilliencyScore}>
            {data.resiliency_score === undefined
              ? 'NA'
              : `${data.resiliency_score}%`}
          </Typography>
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

        {/* 3. Target Sub Section */}
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
