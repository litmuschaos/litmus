import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React from 'react';
import YAML from 'yaml';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import YamlEditor from '../../../components/YamlEditor/Editor';
import { WORKFLOW_LIST_DETAILS } from '../../../graphql';
import {
  ListWorkflowsInput,
  ScheduledWorkflows,
} from '../../../models/graphql/workflowListData';
import useStyles from './styles';

interface ManifestModalProps {
  project_id: string;
  workflow_id: string | undefined;
}

const ManifestModal: React.FC<ManifestModalProps> = ({
  project_id,
  workflow_id,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data, loading } = useQuery<ScheduledWorkflows, ListWorkflowsInput>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: {
        workflowInput: {
          project_id,
          workflow_ids: [workflow_id ?? ''],
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
                data?.ListWorkflow.workflows[0].workflow_manifest as string
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
