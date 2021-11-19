import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Icon, InputField } from 'litmus-ui';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { useTranslation } from 'react-i18next';
import SwitchButton from '../../../../components/SwitchButton';
import { RootState } from '../../../../redux/reducers';
import useStyle from './styles';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { isCronWorkflow } from '../../../../utils/yamlUtils';

interface AdvanceTuningProps {
  closeAdvanceTuning: () => void;
}

interface TolerationType {
  effect: string;
  key: string;
  operator: string;
  value: string;
}

const AdvanceTuning: React.FC<AdvanceTuningProps> = ({
  closeAdvanceTuning,
}) => {
  const { t } = useTranslation();
  const classes = useStyle();
  const { manifest } = useSelector(
    (state: RootState) => state.workflowManifest
  );
  const cronWorkflow = isCronWorkflow(YAML.parse(manifest));
  const workflowAction = useActions(WorkflowActions);
  const parsedManifest = YAML.parse(manifest);
  const [enableNodeSelector, setEnableNodeSelector] = useState<boolean>(
    cronWorkflow
      ? !!parsedManifest.spec.workflowSpec.nodeSelector
      : !!parsedManifest.spec.nodeSelector
  );
  const [enableToleration, setEnableToleration] = useState<boolean>(
    cronWorkflow
      ? !!parsedManifest.spec.workflowSpec.tolerations
      : !!parsedManifest.spec.tolerations
  );
  const [enablePodGC, setEnablePodGC] = useState<boolean>(
    cronWorkflow
      ? !!parsedManifest.spec.workflowSpec.podGC
      : !!parsedManifest.spec.podGC
  );

  const [nodeSelector, setNodeSelector] = useState<string>(
    cronWorkflow
      ? (parsedManifest.spec.workflowSpec?.nodeSelector &&
          parsedManifest.spec.workflowSpec?.nodeSelector[
            'kubernetes.io/hostname'
          ]) ??
          ''
      : (parsedManifest.spec.nodeSelector &&
          parsedManifest.spec.nodeSelector['kubernetes.io/hostname']) ??
          ''
  );
  const [tolerations, setTolerations] = useState<TolerationType>(
    cronWorkflow
      ? (parsedManifest.spec.workflowSpec?.tolerations && {
          effect: parsedManifest.spec.workflowSpec?.tolerations?.effect ?? '',
          key: parsedManifest.spec.workflowSpec?.tolerations?.key ?? '',
          operator:
            parsedManifest.spec.workflowSpec?.tolerations?.operator ?? '',
          value: parsedManifest.spec.workflowSpec?.tolerations?.value ?? '',
        }) ?? {
          effect: '',
          key: '',
          operator: '',
          value: '',
        }
      : (parsedManifest.spec.tolerations && {
          effect: parsedManifest.spec.tolerations.effect ?? '',
          key: parsedManifest.spec.tolerations.key ?? '',
          operator: parsedManifest.spec.tolerations.operator ?? '',
          value: parsedManifest.spec.tolerations.value ?? '',
        }) ?? {
          effect: '',
          key: '',
          operator: '',
          value: '',
        }
  );
  const [podGC, setPodGC] = useState<string>(
    cronWorkflow
      ? (parsedManifest.spec.workflowSpec.podGC &&
          parsedManifest.spec.workflowSpec.podGC.strategy) ??
          'OnWorkflowCompletion'
      : (parsedManifest.spec.podGC && parsedManifest.spec.podGC.strategy) ??
          'OnWorkflowCompletion'
  );

  const handleNodeSelector = () => {
    setEnableNodeSelector(!enableNodeSelector);
  };
  const handleToleration = () => {
    setEnableToleration(!enableToleration);
  };
  const handlePodGC = () => {
    setEnablePodGC(!enablePodGC);
  };

  const handleWorkflowChange = () => {
    const updatedYaml = YAML.parse(manifest);

    if (updatedYaml.kind.toLowerCase() === 'workflow') {
      /**
       * If enableNodeSelector is true, the value of nodeSelector is added
       * else if the enableNodeSelector is false and it exists, the value is removed
       */
      if (enableNodeSelector) {
        updatedYaml.spec['nodeSelector'] = {
          'kubernetes.io/hostname': nodeSelector,
        };
      } else if (!enableNodeSelector && updatedYaml.spec['nodeSelector']) {
        delete updatedYaml.spec['nodeSelector'];
      }

      /**
       * If enableToleration is true, the value of tolerations is added
       * else if the enableToleration is false and it exists, the value is removed
       */
      if (enableToleration) {
        updatedYaml.spec['tolerations'] = tolerations;
      } else if (!enableToleration && updatedYaml.spec['tolerations']) {
        delete updatedYaml.spec['tolerations'];
      }

      /**
       * If enablePodGC is true, the value of PodGC is added
       * else if the enablePodGC is false and it exists, the value is removed
       */
      if (enablePodGC) {
        updatedYaml.spec['podGC'] = {
          strategy: podGC,
        };
      } else if (!enablePodGC && updatedYaml.spec['podGC']) {
        delete updatedYaml.spec['podGC'];
      }
    }

    if (updatedYaml.kind.toLowerCase() === 'cronworkflow') {
      /**
       * NodeSelector changes for CronWorkflow
       */
      if (enableNodeSelector) {
        updatedYaml.spec.workflowSpec['nodeSelector'] = {
          'kubernetes.io/hostname': nodeSelector,
        };
      } else if (
        !enableNodeSelector &&
        updatedYaml.spec.workflowSpec['nodeSelector']
      ) {
        delete updatedYaml.spec.workflowSpec['nodeSelector'];
      }

      /**
       * Toleration changes for CronWorkflow
       */
      if (enableToleration) {
        updatedYaml.spec.workflowSpec['tolerations'] = tolerations;
      } else if (
        !enableToleration &&
        updatedYaml.spec.workflowSpec['tolerations']
      ) {
        delete updatedYaml.spec.workflowSpec['tolerations'];
      }

      /**
       * PodGC changes for CronWorkflow
       */
      if (enablePodGC) {
        updatedYaml.spec.workflowSpec['podGC'] = {
          strategy: podGC,
        };
      } else if (!enablePodGC && updatedYaml.spec.workflowSpec['podGC']) {
        delete updatedYaml.spec.workflowSpec['podGC'];
      }
    }

    workflowAction.setWorkflowManifest({
      manifest: YAML.stringify(updatedYaml),
    });

    closeAdvanceTuning();
  };

  return (
    <div className={classes.root}>
      <div className={classes.headingDiv}>
        <div>
          <Typography gutterBottom className={classes.header}>
            {t('createWorkflow.chooseWorkflow.advance')}
          </Typography>
          <Typography className={classes.headerDesc}>
            {t('createWorkflow.chooseWorkflow.advanceDesc')}
          </Typography>
        </div>
        <ButtonOutlined
          onClick={closeAdvanceTuning}
          className={classes.closeBtn}
        >
          <Icon name="close" />
        </ButtonOutlined>
      </div>
      <div className={classes.tuneDiv}>
        <div className={classes.tuneHeaderDiv}>
          <div>
            <Typography gutterBottom className={classes.tuneName}>
              {t('createWorkflow.chooseWorkflow.nodeSelector')}
            </Typography>
            <Typography className={classes.tuneDesc}>
              {t('createWorkflow.chooseWorkflow.nodeSelectorDesc')}
            </Typography>
            {enableNodeSelector && (
              <div className={classes.tunePropDiv}>
                <Typography className={classes.hostName}>
                  {t('createWorkflow.chooseWorkflow.nodeSelectorValue')} :{' '}
                </Typography>
                <InputField
                  variant="primary"
                  width="40%"
                  value={nodeSelector}
                  onChange={(event) => setNodeSelector(event.target.value)}
                />
              </div>
            )}
          </div>
          <SwitchButton
            checked={enableNodeSelector}
            handleChange={handleNodeSelector}
          />
        </div>
        <hr className={classes.hrDiv} />
        <div className={classes.tuneHeaderDiv}>
          <div>
            <Typography gutterBottom className={classes.tuneName}>
              {t('createWorkflow.chooseWorkflow.toleration')}
            </Typography>
            <Typography className={classes.tuneDesc}>
              {t('createWorkflow.chooseWorkflow.tolerationDesc')}
            </Typography>
            {enableToleration && (
              <div>
                <div className={classes.tunePropDiv}>
                  <Typography className={classes.tunePropText}>
                    {t('createWorkflow.chooseWorkflow.effect')} :{' '}
                  </Typography>
                  <InputField
                    variant="primary"
                    width="40%"
                    value={tolerations.effect}
                    onChange={(event) => {
                      setTolerations({
                        ...tolerations,
                        effect: event.target.value,
                      });
                    }}
                  />
                </div>
                <div className={classes.tunePropDiv}>
                  <Typography className={classes.tunePropText}>
                    {t('createWorkflow.chooseWorkflow.key')} :{' '}
                  </Typography>
                  <InputField
                    variant="primary"
                    width="40%"
                    value={tolerations.key}
                    onChange={(event) => {
                      setTolerations({
                        ...tolerations,
                        key: event.target.value,
                      });
                    }}
                  />
                </div>
                <div className={classes.tunePropDiv}>
                  <Typography className={classes.tunePropText}>
                    {t('createWorkflow.chooseWorkflow.operator')} :{' '}
                  </Typography>
                  <InputField
                    variant="primary"
                    width="40%"
                    value={tolerations.operator}
                    onChange={(event) => {
                      setTolerations({
                        ...tolerations,
                        operator: event.target.value,
                      });
                    }}
                  />
                </div>
                <div className={classes.tunePropDiv}>
                  <Typography className={classes.tunePropText}>
                    {t('createWorkflow.chooseWorkflow.value')} :{' '}
                  </Typography>
                  <InputField
                    variant="primary"
                    width="40%"
                    value={tolerations.value}
                    onChange={(event) => {
                      setTolerations({
                        ...tolerations,
                        value: event.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <SwitchButton
            checked={enableToleration}
            handleChange={handleToleration}
          />
        </div>
        <hr className={classes.hrDiv} />
        <div className={classes.tuneHeaderDiv}>
          <div>
            <Typography gutterBottom className={classes.tuneName}>
              {t('createWorkflow.chooseWorkflow.cleanUp')}
            </Typography>
            <Typography className={classes.tuneDesc}>
              {t('createWorkflow.chooseWorkflow.cleanUpDesc')}
            </Typography>
            {enablePodGC && (
              <div>
                <div className={classes.tunePropDiv}>
                  <Typography className={classes.podGCText}>
                    {t('createWorkflow.chooseWorkflow.strategy')} :{' '}
                  </Typography>
                  <FormControl className={classes.podGCSelect}>
                    <InputLabel id="podGD-select">
                      {t('createWorkflow.chooseWorkflow.podGC')}
                    </InputLabel>
                    <Select
                      labelId="podGD-select"
                      value={podGC}
                      label="podGC"
                      onChange={(event) => {
                        setPodGC(event.target.value as string);
                      }}
                    >
                      <MenuItem value="OnWorkflowCompletion">
                        {t('createWorkflow.chooseWorkflow.complete')}
                      </MenuItem>
                      <MenuItem value="OnWorkflowSuccess">
                        {t('createWorkflow.chooseWorkflow.success')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            )}
          </div>
          <SwitchButton checked={enablePodGC} handleChange={handlePodGC} />
        </div>
      </div>
      <ButtonFilled
        onClick={handleWorkflowChange}
        className={classes.saveChangesBtn}
      >
        {t('createWorkflow.chooseWorkflow.saveChanges')}
      </ButtonFilled>
    </div>
  );
};

export default AdvanceTuning;
