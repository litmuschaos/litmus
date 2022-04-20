import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import YAML from 'yaml';
import Loader from '../../../components/Loader';
import YamlEditor from '../../../components/YamlEditor/Editor';
import { GET_WORKFLOW_DETAILS } from '../../../graphql';
import {
  GetWorkflowsRequest,
  ScheduledWorkflows,
} from '../../../models/graphql/workflowListData';
import useStyles from './styles';

interface ManifestModalProps {
  projectID: string;
  workflowID: string | undefined;
}

const ManifestModal: React.FC<ManifestModalProps> = ({
  projectID,
  workflowID,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data, loading } = useQuery<ScheduledWorkflows, GetWorkflowsRequest>(
    GET_WORKFLOW_DETAILS,
    {
      variables: {
        request: {
          projectID,
          workflowIDs: [workflowID ?? ''],
        },
      },
    }
  );

  return (
    <div className={classes.workflowModalRoot}>
      <Typography variant="h4">
        {t('chaosWorkflows.browseWorkflows.workflowManifest')}
      </Typography>
      <div className={classes.editor}>
        {loading ? (
          <Loader />
        ) : (
          <YamlEditor
            content={YAML.stringify(
              YAML.parse(
                data?.getWorkflow.workflows[0].workflowManifest as string
              )
            )}
            filename="Workflow Template"
            readOnly
            enableDownloadCopy
          />
        )}
      </div>
    </div>
  );
};

export default ManifestModal;
