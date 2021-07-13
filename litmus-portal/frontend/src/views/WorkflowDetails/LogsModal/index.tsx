/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Typography } from '@material-ui/core';
import { ButtonOutlined, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ExecutionData, Node } from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as NodeSelectionActions from '../../../redux/actions/nodeSelection';
import { RootState } from '../../../redux/reducers';
import timeDifference from '../../../utils/datesModifier';
import trimstring from '../../../utils/trim';
import LogsSwitcher from '../LogsSwitcher';
import WorkflowStatus from '../WorkflowStatus';
import useStyles from './styles';

interface NodeLogsModalProps {
  logsOpen: boolean;
  handleClose: () => void;
  cluster_id: string;
  workflow_run_id: string;
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
  data,
  workflow_name,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const nodeSelection = useActions(NodeSelectionActions);
  const [nodesArray, setNodesArray] = useState<SelectedNodeType[]>([]);

  const { pod_name } = useSelector((state: RootState) => state.selectedNode);

  const changeNodeLogs = (selectedKey: string) => {
    nodeSelection.selectNode({
      ...data.nodes[selectedKey],
      pod_name: selectedKey,
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
          <Typography className={classes.title}>
            {t('workflowDetailsView.headerDesc')} {workflow_name}
          </Typography>
        </div>
        <div className={classes.section}>
          <div className={classes.nodesData}>
            {nodesArray.map((node: SelectedNodeType) => (
              <div
                className={`${classes.nodeData}
                  ${node.id === pod_name && classes.selectedNode}`}
                onClick={() => changeNodeLogs(node.id)}
                key={node.id}
              >
                <div className={classes.experiment}>
                  <span className={classes.icon}>
                    <img
                      src="./icons/experiment_icon.svg"
                      alt="Experiment Icon"
                    />
                  </span>
                  <Typography className={classes.nodeName}>
                    {trimstring(node.name, 20)}
                  </Typography>
                </div>
                <div className={classes.statusWidth}>
                  <WorkflowStatus phase={node.phase} />
                </div>
              </div>
            ))}
          </div>
          <div className={classes.logsPanel}>
            <div className={classes.logsHeader}>
              <div className={classes.experiment}>
                <span className={classes.icon}>
                  <img
                    src="./icons/experiment_icon.svg"
                    alt="Experiment Icon"
                  />
                </span>
                <Typography className={classes.nodeName}>
                  <strong>{trimstring(data.nodes[pod_name].name, 30)}</strong>
                </Typography>
              </div>
              <WorkflowStatus phase={data.nodes[pod_name].phase} />
              <div>
                <Typography className={classes.subLogsHeader}>
                  <strong>
                    {t('workflowDetailsView.workflowInfo.runTime.startTime')}
                  </strong>
                </Typography>
                <Typography>
                  {data.nodes[pod_name].phase === 'Pending'
                    ? '- -'
                    : timeDifference(data.nodes[pod_name].startedAt)}
                </Typography>
              </div>
              <div>
                <Typography className={classes.subLogsHeader}>
                  <strong>
                    {t('workflowDetailsView.workflowInfo.runTime.endTime')}
                  </strong>
                </Typography>
                <Typography>
                  {data.nodes[pod_name].finishedAt === '' ? (
                    <span>- -</span>
                  ) : (
                    <span>
                      {timeDifference(data.nodes[pod_name].finishedAt)}
                    </span>
                  )}
                </Typography>
              </div>
            </div>
            <div className={classes.logsHeight}>
              <LogsSwitcher
                cluster_id={cluster_id}
                workflow_run_id={workflow_run_id}
                pod_namespace={data.namespace}
                pod_name={pod_name}
                pod_type={data.nodes[pod_name].type}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NodeLogsModal;
