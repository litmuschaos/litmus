/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Typography } from '@material-ui/core';
import { ButtonOutlined, Modal } from 'litmus-ui';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useStyles from './styles';
import timeDifference from '../../../utils/datesModifier';
import { RootState } from '../../../redux/reducers';
import { ExecutionData, Node } from '../../../models/graphql/workflowData';
import * as NodeSelectionActions from '../../../redux/actions/nodeSelection';
import NodeLogs from '../NodeLogs';
import trimstring from '../../../utils/trim';
import useActions from '../../../redux/actions';
import WorkflowStatus from '../WorkflowStatus';

interface NodeLogsModalProps {
  logsOpen: boolean;
  handleClose: () => void;
  cluster_id: string;
  workflow_run_id: string;
  pod_namespace: string;
  data: ExecutionData;
  workflow_name: string;
}

interface SelectedNodeType extends Node {
  id: string;
}

const NodeLogsModal: React.FC<NodeLogsModalProps> = ({
  logsOpen,
  handleClose,
  cluster_id,
  workflow_run_id,
  pod_namespace,
  data,
  workflow_name,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedNodeID, setSelectedNodeID] = useState<string>(
    Object.keys(data.nodes)[1]
  );
  const nodeSelection = useActions(NodeSelectionActions);
  const [nodesArray, setNodesArray] = useState<SelectedNodeType[]>([]);

  const { name, phase, pod_name, type, startedAt, finishedAt } = useSelector(
    (state: RootState) => state.selectedNode
  );

  const changeNodeLogs = (selectedKey: string) => {
    nodesArray.forEach((node) => {
      if (node.id === selectedKey) {
        setSelectedNodeID(node.id);
      }
    });
  };

  useEffect(() => {
    const filteredNodes: SelectedNodeType[] = [];
    Object.keys(data.nodes).forEach((key) => {
      if (
        data.nodes[key].type !== 'StepGroup' &&
        data.nodes[key].type !== 'Steps'
      ) {
        filteredNodes.push({ ...data.nodes[key], id: key });
      }
    });
    setNodesArray([...filteredNodes]);
  }, [data]);

  useEffect(() => {
    nodeSelection.selectNode({
      ...data.nodes[selectedNodeID],
      pod_name: selectedNodeID,
    });
  }, [selectedNodeID]);

  return (
    <Modal
      open={logsOpen}
      onClose={handleClose}
      modalActions={
        <ButtonOutlined className={classes.closeButton} onClick={handleClose}>
          &#x2715;
        </ButtonOutlined>
      }
    >
      <div className={classes.root}>
        <div className={classes.header}>
          <span className={classes.icon}>
            <img src="/icons/workflow_icon.svg" alt="Workflow Icon" />
          </span>
          <Typography className={classes.title}>
            {t('workflowDetailsView.headerDesc')} {workflow_name}
          </Typography>
        </div>
        <hr />
        <div className={classes.section}>
          <div className={classes.nodesData}>
            {nodesArray.map((node: SelectedNodeType) => (
              <div
                className={classes.nodeData}
                onClick={() => changeNodeLogs(node.id)}
                key={node.id}
              >
                <div className={classes.experiment}>
                  <span className={classes.icon}>
                    <img
                      src="/icons/experiment_icon.svg"
                      alt="Experiment Icon"
                    />
                  </span>
                  <Typography className={classes.nodeName}>
                    {trimstring(node.name, 20)}
                  </Typography>
                </div>
                <WorkflowStatus phase={node.phase} />
              </div>
            ))}
          </div>
          <div className={classes.logsPanel}>
            <div className={classes.logsHeader}>
              <div className={classes.experiment}>
                <span className={classes.icon}>
                  <img src="/icons/experiment_icon.svg" alt="Experiment Icon" />
                </span>
                <Typography className={classes.nodeName}>
                  <strong>{trimstring(name, 30)}</strong>
                </Typography>
              </div>
              <WorkflowStatus phase={phase} />
              <div>
                <Typography className={classes.subLogsHeader}>
                  <strong>
                    {t('workflowDetailsView.workflowInfo.runTime.startTime')}
                  </strong>
                </Typography>
                <Typography>{timeDifference(startedAt)}</Typography>
              </div>
              <div>
                <Typography className={classes.subLogsHeader}>
                  <strong>
                    {t('workflowDetailsView.workflowInfo.runTime.endTime')}
                  </strong>
                </Typography>
                <Typography>{timeDifference(finishedAt)}</Typography>
              </div>
            </div>
            <div className={classes.logsHeight}>
              <NodeLogs
                cluster_id={cluster_id}
                workflow_run_id={workflow_run_id}
                pod_namespace={pod_namespace}
                pod_name={pod_name}
                pod_type={type}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NodeLogsModal;
