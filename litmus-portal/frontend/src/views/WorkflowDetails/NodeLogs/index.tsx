import { useSubscription } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Unimodal from '../../../containers/layouts/Unimodal';
import { WORKFLOW_LOGS } from '../../../graphql';
import {
  PodLog,
  PodLogRequest,
  PodLogVars,
} from '../../../models/graphql/podLog';
import useStyles from './styles';

interface NodeLogsProps extends PodLogRequest {
  logsOpen: boolean;
  handleClose: () => void;
}

const NodeLogs: React.FC<NodeLogsProps> = ({
  logsOpen,
  handleClose,
  cluster_id,
  workflow_run_id,
  pod_namespace,
  pod_name,
  pod_type,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { data } = useSubscription<PodLog, PodLogVars>(WORKFLOW_LOGS, {
    variables: {
      podDetails: {
        cluster_id,
        workflow_run_id,
        pod_name,
        pod_namespace,
        pod_type,
      },
    },
  });

  return (
    <Unimodal
      open={logsOpen}
      handleClose={handleClose}
      hasCloseBtn
      textAlign="left"
    >
      <div className={classes.root}>
        {data !== undefined ? (
          <Typography variant="h5">{data.getPodLog.log}</Typography>
        ) : (
          <Typography variant="h5">
            {t('workflowDetailsView.nodeLogs.fetching')}
          </Typography>
        )}
      </div>
    </Unimodal>
  );
};

export default NodeLogs;
