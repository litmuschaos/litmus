import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonOutlined, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import YAML from 'yaml';
import { WORKFLOW_DETAILS } from '../../../graphql';
import {
  Workflow,
  WorkflowDataVars,
} from '../../../models/graphql/workflowData';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';

interface ChaosResultProps {
  chaosResultOpen: boolean;
  handleResultClose: () => void;
  workflow_run_id: string;
  pod_name: string;
}

const ChaosResult: React.FC<ChaosResultProps> = ({
  chaosResultOpen,
  handleResultClose,
  workflow_run_id,
  pod_name,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();

  const { data: workflow_data } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    { variables: { projectID: projectID } }
  );

  const workflow = workflow_data?.getWorkFlowRuns.filter(
    (w) => w.workflow_run_id === workflow_run_id
  )[0];

  const [chaosResult, setChaosResult] = useState('');
  useEffect(() => {
    if (workflow !== undefined) {
      const nodeData = JSON.parse(workflow.execution_data).nodes[pod_name];
      if (nodeData.chaosData?.chaosResult) {
        setChaosResult(YAML.stringify(nodeData.chaosData?.chaosResult));
      } else {
        setChaosResult('Chaos Result Not available');
      }
    }
  }, [workflow_data]);

  return (
    <Modal
      open={chaosResultOpen}
      onClose={handleResultClose}
      width="60%"
      modalActions={
        <ButtonOutlined
          className={classes.closeButton}
          onClick={handleResultClose}
        >
          <Typography className={classes.crossMark}> &#x2715;</Typography>
        </ButtonOutlined>
      }
    >
      <div className={classes.modalRoot}>
        <div className={classes.logs}>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            <Typography className={classes.text}>{chaosResult}</Typography>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChaosResult;
