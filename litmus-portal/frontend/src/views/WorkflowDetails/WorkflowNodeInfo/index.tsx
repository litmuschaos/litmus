/* eslint-disable */
import { Button, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import timeDifference from '../../../utils/datesModifier';
import useStyles from './styles';
import trimstring from '../../../utils/trim';
import WorkflowStatus from '../WorkflowStatus';
import LogsSwitcher from '../LogsSwitcher';
import { stepEmbeddedYAMLExtractor } from '../../../utils/yamlUtils';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import YAML from 'yaml';
import { ButtonOutlined } from 'litmus-ui';
import { Node } from '../../../models/graphql/workflowData';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/reducers';

interface WorkflowNodeInfoProps {
  setIsInfoToggled: React.Dispatch<React.SetStateAction<boolean>>;
  manifest: string;
  cluster_id: string;
  workflow_run_id: string;
  pod_namespace: string;
  selectedNode: Node;
}

const WorkflowNodeInfo: React.FC<WorkflowNodeInfoProps> = ({
  manifest,
  cluster_id,
  workflow_run_id,
  pod_namespace,
  setIsInfoToggled,
  selectedNode,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isAppInfoVisible, setIsAppInfoVisible] = useState(false);

  const { pod_name } = useSelector((state: RootState) => state.selectedNode);

  const embeddedYAMLString = stepEmbeddedYAMLExtractor(
    manifest,
    selectedNode.name
  );

  return (
    <div className={classes.root}>
      {/* Node Details */}

      {/* Header*/}
      <div className={classes.header}>
        <Typography className={classes.title}>
          <strong>{trimstring(selectedNode.name, 30)}</strong>
        </Typography>
        <ButtonOutlined
          className={classes.closeButton}
          onClick={() => {
            setIsInfoToggled(false);
          }}
        >
          &#x2715;
        </ButtonOutlined>
      </div>

      {/*Section */}
      <div className={classes.section}>
        {/*Left-Panel Containing details about selected Node. */}
        <div className={classes.leftPanel}>
          {/*Phase */}
          <WorkflowStatus phase={selectedNode.phase} />
          {/*Start Time */}
          <Typography className={classes.textMargin}>
            <strong>
              {t('workflowDetailsView.workflowNodeInfo.startTime')}:
            </strong>
            &nbsp;&nbsp;&nbsp;
            <span>{timeDifference(selectedNode.startedAt)}</span>
          </Typography>
          {/*End Time */}
          <Typography className={classes.textMargin}>
            <strong>
              {t('workflowDetailsView.workflowNodeInfo.endTime')}:
            </strong>
            &nbsp;&nbsp;&nbsp;
            {selectedNode.finishedAt !== '' ? (
              <span>{timeDifference(selectedNode.finishedAt)}</span>
            ) : (
              <span>Not Yet Finished</span>
            )}
          </Typography>
          {/*Duration */}
          <Typography className={classes.textMargin}>
            <strong>
              {t('workflowDetailsView.workflowNodeInfo.duration')}:
            </strong>
            &nbsp;&nbsp;&nbsp;
            {selectedNode.finishedAt !== ''
              ? (
                  (parseInt(selectedNode.finishedAt, 10) -
                    parseInt(selectedNode.startedAt, 10)) /
                  60
                ).toFixed(1)
              : (
                  (new Date().getTime() / 1000 -
                    parseInt(selectedNode.startedAt, 10)) /
                  60
                ).toFixed(1)}{' '}
            minutes
          </Typography>
          {/*Button to show Application Details */}
          {selectedNode.type === 'ChaosEngine' && (
            <>
              <Button
                onClick={() => setIsAppInfoVisible(!isAppInfoVisible)}
                style={{ textTransform: 'none' }}
                className={classes.textMargin}
              >
                {isAppInfoVisible ? (
                  <KeyboardArrowDownIcon className={classes.icon} />
                ) : (
                  <ChevronRightIcon className={classes.icon} />
                )}
                <Typography>
                  <strong>
                    {t(
                      'workflowDetailsView.workflowNodeInfo.viewApplicationDetails'
                    )}
                  </strong>
                </Typography>
              </Button>
              {isAppInfoVisible && (
                <Typography className={classes.textMargin}>
                  {embeddedYAMLString &&
                    Object.keys(
                      YAML.parse(embeddedYAMLString).spec.appinfo
                    ).map((key) => (
                      <div>
                        <strong>{key} :</strong>
                        <span>
                          &nbsp;&nbsp;
                          {YAML.parse(embeddedYAMLString).spec.appinfo[key]}
                        </span>
                      </div>
                    ))}
                </Typography>
              )}
            </>
          )}
        </div>
        {/*Right Panel for Node Logs*/}
        <div className={classes.rightPanel}>
          <LogsSwitcher
            cluster_id={cluster_id}
            workflow_run_id={workflow_run_id}
            pod_namespace={pod_namespace}
            pod_type={selectedNode.type}
            pod_name={pod_name}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowNodeInfo;
