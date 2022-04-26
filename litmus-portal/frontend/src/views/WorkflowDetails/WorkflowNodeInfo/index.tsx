import { IconButton, Typography } from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { ExecutionData } from '../../../models/graphql/workflowData';
import { RootState } from '../../../redux/reducers';
import timeDifference from '../../../utils/datesModifier';
import trimstring from '../../../utils/trim';
import { stepEmbeddedYAMLExtractor } from '../../../utils/yamlUtils';
import WorkflowStatus from '../WorkflowStatus';
import useStyles from './styles';

interface WorkflowNodeInfoProps {
  setIsInfoToggled: React.Dispatch<React.SetStateAction<boolean>>;
  manifest: string;
  clusterID: string;
  workflowRunID: string;
  data: ExecutionData;
}

const WorkflowNodeInfo: React.FC<WorkflowNodeInfoProps> = ({
  manifest,
  clusterID,
  workflowRunID,
  data,
  setIsInfoToggled,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isAppInfoVisible, setIsAppInfoVisible] = useState(false);

  const { podName } = useSelector((state: RootState) => state.selectedNode);

  const [embeddedYAMLString, setEmbeddedYAMLString] = useState('');

  useEffect(() => {
    const currentEmbeddedYAMLString = stepEmbeddedYAMLExtractor(
      manifest,
      data.nodes[podName].name
    );
    setEmbeddedYAMLString(currentEmbeddedYAMLString);
    if (embeddedYAMLString && !YAML.parse(embeddedYAMLString).spec.appinfo)
      setIsAppInfoVisible(false);
  }, [podName]);

  return (
    <div className={classes.root}>
      {/* Node Details */}

      {/* Header */}
      <div className={classes.header}>
        <Typography className={classes.title}>
          <strong>{trimstring(data.nodes[podName].name, 30)}</strong>
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

      {/* Section */}
      <div className={classes.section}>
        {/* Left-Panel Containing details about selected Node. */}
        <div className={classes.leftPanel}>
          {/* Phase */}
          <WorkflowStatus phase={data.nodes[podName].phase} />
          {/* Start Time */}
          <Typography className={classes.textMargin}>
            <strong>
              {t('workflowDetailsView.workflowNodeInfo.startTime')}:
            </strong>
            &nbsp;&nbsp;&nbsp;
            <span>
              {data.nodes[podName].phase !== 'Pending'
                ? timeDifference(data.nodes[podName].startedAt)
                : '- -'}
            </span>
          </Typography>
          {/* End Time */}
          <Typography className={classes.textMargin}>
            <strong>
              {t('workflowDetailsView.workflowNodeInfo.endTime')}:
            </strong>
            &nbsp;&nbsp;&nbsp;
            {data.nodes[podName].finishedAt !== '' ? (
              <span>{timeDifference(data.nodes[podName].finishedAt)}</span>
            ) : (
              <span>- -</span>
            )}
          </Typography>
          {/* Duration */}
          <Typography className={classes.textMargin}>
            <strong>
              {t('workflowDetailsView.workflowNodeInfo.duration')}:
            </strong>
            &nbsp;&nbsp;&nbsp;
            {data.nodes[podName].finishedAt !== ''
              ? (
                  (parseInt(data.nodes[podName].finishedAt, 10) -
                    parseInt(data.nodes[podName].startedAt, 10)) /
                  60
                ).toFixed(1)
              : (
                  (new Date().getTime() / 1000 -
                    parseInt(data.nodes[podName].startedAt, 10)) /
                  60
                ).toFixed(1)}{' '}
            minutes
          </Typography>
          {/* Button to show Application Details */}
          {data.nodes[podName].type === 'ChaosEngine' && embeddedYAMLString && (
            <>
              <IconButton
                disabled={!YAML.parse(embeddedYAMLString).spec.appinfo}
                onClick={() => setIsAppInfoVisible(!isAppInfoVisible)}
                className={classes.buttonAlign}
              >
                {isAppInfoVisible ? (
                  <img
                    src="./icons/down-arrow.svg"
                    alt="down arrow icon"
                    className={classes.icon}
                  />
                ) : (
                  <img
                    src="./icons/right-arrow.svg"
                    alt="right-arrow icon"
                    className={classes.icon}
                  />
                )}
                <Typography>
                  <strong>
                    {t(
                      'workflowDetailsView.workflowNodeInfo.viewApplicationDetails'
                    )}
                  </strong>
                </Typography>
              </IconButton>
              {isAppInfoVisible && YAML.parse(embeddedYAMLString).spec.appinfo && (
                <Typography className={classes.textMargin}>
                  {Object.keys(YAML.parse(embeddedYAMLString).spec.appinfo).map(
                    (key, index) => (
                      <div key={index.toString()}>
                        <strong>{key} :</strong>
                        <span>
                          &nbsp;&nbsp;
                          {YAML.parse(embeddedYAMLString).spec.appinfo[key]}
                        </span>
                      </div>
                    )
                  )}
                </Typography>
              )}
            </>
          )}
        </div>
        {/* Right Panel for Node Logs */}
        <div className={classes.rightPanel}>
          {/* TODO: fix */}
          {/* <LogsSwitcher
            clusterID={clusterID}
            workflowRunID={workflowRunID}
            podNamespace={data.namespace}
            podType={data.nodes[podName].type}
            podName={podName}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default WorkflowNodeInfo;
