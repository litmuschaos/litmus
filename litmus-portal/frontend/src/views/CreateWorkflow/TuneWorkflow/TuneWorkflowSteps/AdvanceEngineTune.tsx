import { Button, Typography } from '@material-ui/core';
import { InputField } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import SwitchButton from '../../../../components/SwitchButton';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { RootState } from '../../../../redux/reducers';
import useStyle from './styles';

interface AdvanceTuningProps {
  infra: boolean;
  engineIndex: number;
  gotoStep: (page: number) => void;
  closeStepper: () => void;
}

interface TolerationType {
  effect: string;
  key: string;
  operator: string;
  value: string;
}

const AdvanceEngineTuning: React.FC<AdvanceTuningProps> = ({
  infra,
  engineIndex,
  gotoStep,
  closeStepper,
}) => {
  const { t } = useTranslation();
  const classes = useStyle();
  const { manifest, engineYAML } = useSelector(
    (state: RootState) => state.workflowManifest
  );
  const workflow = useActions(WorkflowActions);
  const engineManifest = YAML.parse(engineYAML);

  const [enableAnnotationCheck, setEnableAnnotationCheck] = useState<boolean>(
    engineManifest?.spec?.annotationCheck === 'true'
  );
  const [enableNodeSelector, setEnableNodeSelector] = useState<boolean>(
    !!engineManifest.spec?.experiments[0]?.spec?.components?.nodeSelector
  );
  const [enableToleration, setEnableToleration] = useState<boolean>(
    !!engineManifest?.spec?.experiments[0]?.spec?.components?.tolerations
  );

  const expSpec = engineManifest?.spec?.experiments[0]?.spec;

  const [nodeSelectorKey, setNodeSelectorKey] = useState<string>(
    engineManifest.spec?.experiments[0]?.spec?.components?.nodeSelector &&
      Object.keys(
        engineManifest.spec.experiments[0].spec.components.nodeSelector
      )[0]
      ? Object.keys(
          engineManifest.spec.experiments[0].spec.components.nodeSelector
        )[0]
      : ''
  );
  const [nodeSelectorValue, setNodeSelectorValue] = useState<string>(
    engineManifest.spec?.experiments[0]?.spec?.components?.nodeSelector &&
      Object.keys(
        engineManifest.spec.experiments[0].spec.components.nodeSelector
      )[0]
      ? engineManifest.spec.experiments[0].spec.components.nodeSelector[
          nodeSelectorKey as string
        ]
      : ''
  );
  const [tolerations, setTolerations] = useState<TolerationType>(
    (expSpec?.components?.tolerations && {
      effect: expSpec?.components?.tolerations[0]?.effect ?? '',
      key: expSpec?.components?.tolerations[0]?.key ?? '',
      operator: expSpec?.components?.tolerations[0]?.operator ?? '',
      value: expSpec?.components?.tolerations[0]?.value ?? '',
    }) ?? {
      effect: '',
      key: '',
      operator: '',
      value: '',
    }
  );

  const handleNodeSelector = () => {
    setEnableNodeSelector(!enableNodeSelector);
  };
  const handleToleration = () => {
    setEnableToleration(!enableToleration);
  };
  const handleAnnotationCheck = () => {
    setEnableAnnotationCheck(!enableAnnotationCheck);
  };

  const handleMainYAMLChange = () => {
    /**
     * If enableNodeSelector is true, the value of nodeSelector is added
     * else if the enableNodeSelector is false and it exists, the value is removed
     */
    if (enableNodeSelector) {
      engineManifest.spec.experiments[0].spec.components['nodeSelector'] = {
        [nodeSelectorKey]: nodeSelectorValue,
      };
      const runner = {
        runner: {
          ...engineManifest.spec?.components?.runner,
          nodeSelector: {
            [nodeSelectorKey]: nodeSelectorValue,
          },
        },
      };
      engineManifest.spec.components = runner;
    } else if (!enableNodeSelector) {
      if (engineManifest.spec?.components?.runner['nodeSelector']) {
        delete engineManifest.spec.components?.runner['nodeSelector'];
        if (
          engineManifest.spec.components?.runner &&
          Object.keys(engineManifest.spec.components?.runner).length === 0
        ) {
          delete engineManifest.spec.components;
        }
      }
      if (
        engineManifest.spec?.experiments[0]?.spec?.components['nodeSelector']
      ) {
        delete engineManifest.spec.experiments[0].spec.components[
          'nodeSelector'
        ];
      }
    }

    /**
     * If enableToleration is true, the value of tolerations is added
     * else if the enableToleration is false and it exists, the value is removed
     */
    if (enableToleration) {
      expSpec.components['tolerations'] = [tolerations];
    } else if (!enableToleration && expSpec?.components['tolerations']) {
      delete expSpec?.components['tolerations'];
    }

    /**
     * If enablePodGC is true, the value of PodGC is added
     * else if the enablePodGC is false and it exists, the value is removed
     */
    if (enableAnnotationCheck) {
      engineManifest.spec['annotationCheck'] = 'true';
    } else if (
      !enableAnnotationCheck &&
      engineManifest.spec['annotationCheck']
    ) {
      delete engineManifest.spec['annotationCheck'];
    }

    const mainManifest = YAML.parse(manifest);
    if (mainManifest.kind.toLowerCase() === 'workflow') {
      mainManifest.spec.templates[engineIndex].inputs.artifacts[0].raw.data =
        YAML.stringify(engineManifest);
    } else {
      mainManifest.spec.workflowSpec.templates[
        engineIndex
      ].inputs.artifacts[0].raw.data = YAML.stringify(engineManifest);
    }
    workflow.setWorkflowManifest({
      manifest: YAML.stringify(mainManifest),
      engineYAML: YAML.stringify(engineManifest),
    });
    closeStepper();
  };

  return (
    <div className={classes.root}>
      <div className={classes.tuneDiv}>
        <div className={classes.tuneHeaderDiv}>
          <div>
            <Typography gutterBottom className={classes.tuneName}>
              {t('createWorkflow.chooseWorkflow.nodeSelector')}
            </Typography>
            <Typography className={classes.tuneDesc}>
              The nodeselector contains labels of the node on which chaos
              experiment and runner pod should be scheduled.
            </Typography>
            {enableNodeSelector && (
              <div className={classes.tunePropDiv}>
                <InputField
                  variant="primary"
                  width="40%"
                  label="key"
                  value={nodeSelectorKey}
                  onChange={(event) => setNodeSelectorKey(event.target.value)}
                />
                <div style={{ margin: 15 }} />
                <InputField
                  variant="primary"
                  width="40%"
                  label="value"
                  value={nodeSelectorValue}
                  onChange={(event) => setNodeSelectorValue(event.target.value)}
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
              It provides tolerations for the Chaos Experiment pod so that it
              can be scheduled on the respective tainted node.
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
              Annotation Check
            </Typography>
            <Typography className={classes.tuneDesc}>
              It controls whether or not the operator checks for the annotation
              litmuschaos.io/chaos to be set against the application under test
              (AUT).
            </Typography>
          </div>
          <SwitchButton
            checked={enableAnnotationCheck}
            handleChange={handleAnnotationCheck}
          />
        </div>
      </div>
      <div style={{ margin: 20 }} />
      <div data-cy="TuneExperimentControlButtons">
        <Button
          onClick={() => gotoStep(infra ? 1 : 2)}
          className={classes.button}
        >
          {t('workflowStepper.back')}
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={
            enableNodeSelector &&
            (nodeSelectorKey.length === 0 || nodeSelectorValue.length === 0)
          }
          onClick={() => handleMainYAMLChange()}
          className={classes.button}
        >
          {t('createWorkflow.tuneWorkflow.env.finish')}
        </Button>
      </div>
    </div>
  );
};

export default AdvanceEngineTuning;
