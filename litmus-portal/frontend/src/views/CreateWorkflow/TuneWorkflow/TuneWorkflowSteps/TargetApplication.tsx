import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { InputField } from 'litmus-ui';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import YAML from 'yaml';
import { useSelector } from 'react-redux';
import { useSubscription } from '@apollo/client';
import { Autocomplete } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import {
  WorkflowData,
  WorkflowManifest,
} from '../../../../models/redux/workflow';
import { RootState } from '../../../../redux/reducers';
import useActions from '../../../../redux/actions';
import {
  GVRRequest,
  KubeObjData,
  KubeObjRequest,
  KubeObjResource,
  KubeObjResponse,
} from '../../../../models/graphql/createWorkflowData';
import { KUBE_OBJ } from '../../../../graphql';

interface AppInfoData {
  namespace: string;
  appLabel: string[];
}

interface TargetApplicationData {
  appns: string | undefined;
  appkind: string;
  applabel: string;
  annotationCheck: boolean;
  jobCleanUpPolicy: string;
}

interface TargetApplicationProp {
  isCustom: boolean | undefined;
  engineIndex: number;
  gotoStep: (page: number) => void;
}

const TargetApplication: React.FC<TargetApplicationProp> = ({
  isCustom,
  engineIndex,
  gotoStep,
}) => {
  const { t } = useTranslation();
  /**
   * State Variables to manage theme changes
   */
  const classes = useStyles();
  const theme = useTheme();

  /**
   * State variable for redux
   */
  const workflow = useActions(WorkflowActions);
  const manifest: WorkflowManifest = useSelector(
    (state: RootState) => state.workflowManifest
  );
  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const { clusterid } = workflowData;
  const engineManifest = YAML.parse(manifest.engineYAML);

  /**
   * State variable for editing the ChaosEngine Configuration
   */
  const [targetApp, setTargetApp] = useState<TargetApplicationData>({
    appns: engineManifest.spec.appinfo?.appns ?? '',
    applabel: engineManifest.spec.appinfo?.applabel ?? '',
    appkind: engineManifest.spec.appinfo?.appkind ?? '',
    annotationCheck:
      typeof engineManifest.spec.annotationCheck === 'boolean'
        ? engineManifest.spec.annotationCheck
        : engineManifest.spec.annotationCheck === 'true',
    jobCleanUpPolicy: engineManifest.spec.jobCleanUpPolicy,
  });
  const [addNodeSelector, setAddNodeSelector] = useState<boolean>(
    !!engineManifest.spec.experiments[0].spec.components['nodeSelectors']
  );
  const [nodeSelector, setNodeSelector] = useState('');
  const [appinfoData, setAppInfoData] = useState<AppInfoData[]>([]);
  const [GVRObj, setGVRObj] = useState<GVRRequest>({
    group: '',
    version: '',
    resource: '',
  });
  const [appLabel, setAppLabel] = useState<string[]>([]);

  /**
   * Function to filter the lables according to the namespace provided
   */
  const handleLabelChange = () => {
    const applabel: string[] = [];
    if (appinfoData !== undefined) {
      appinfoData.forEach((appinfo) => {
        if (appinfo.namespace === targetApp.appns) {
          appinfo.appLabel.forEach((label) => applabel.push(label));
        }
      });
    }
    return applabel.length > 0 ? setAppLabel(applabel) : setAppLabel(['']);
  };

  /**
   * Function for handling AnnotationCheck toggle button
   */
  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: boolean
  ) => {
    if (newAlignment !== null) {
      setTargetApp({ ...targetApp, annotationCheck: newAlignment });
      engineManifest.spec.annotationCheck = newAlignment.toString();
    }
  };

  /**
   * handleMainYAMLChange handles the change in configuration
   * of the Chaos Engine accroding to the index of the main manifest
   */
  const handleMainYAMLChange = () => {
    engineManifest.spec.annotationCheck = targetApp.annotationCheck.toString();
    if (engineManifest.spec.appinfo !== undefined) {
      engineManifest.spec.appinfo.appns = targetApp.appns;
      engineManifest.spec.appinfo.applabel = targetApp.applabel;
      engineManifest.spec.appinfo.appkind = targetApp.appkind;
    }
    if (typeof engineManifest.metadata.namespace === 'object') {
      // Removes any whitespace in '{{workflow.parameters.adminModeNamespace}}'
      const namespace = Object.keys(
        engineManifest.metadata.namespace
      )[0].replace(/\s/g, '');
      engineManifest.metadata.namespace = `{${namespace}}`;
    }
    /**
     * If addNodeSelector is true, the value of nodeselector is added
     * else if the addNodeSelector is false and it exists, the value is removed
     */
    if (addNodeSelector) {
      engineManifest.spec.experiments[0].spec.components['nodeSelectors'] = {
        'kubernetes.io/hostname': nodeSelector,
      };
    } else if (
      !addNodeSelector &&
      engineManifest.spec.experiments[0].spec.components['nodeSelectors']
    ) {
      delete engineManifest.spec.experiments[0].spec.components[
        'nodeSelectors'
      ];
    }
    engineManifest.spec.jobCleanUpPolicy = targetApp.jobCleanUpPolicy;
    const mainManifest = YAML.parse(manifest.manifest);
    mainManifest.spec.templates[
      engineIndex
    ].inputs.artifacts[0].raw.data = YAML.stringify(engineManifest);
    workflow.setWorkflowManifest({
      manifest: YAML.stringify(mainManifest),
      engineYAML: YAML.stringify(engineManifest),
    });
    return isCustom ? gotoStep(2) : gotoStep(1);
  };

  /**
   * GraphQL subscription to fetch the KubeObjData from the server
   */
  const { data } = useSubscription<KubeObjResponse, KubeObjRequest>(KUBE_OBJ, {
    variables: {
      data: {
        cluster_id: clusterid,
        object_type: 'kubeobject',
        kube_obj_request: {
          group: GVRObj.group,
          version: GVRObj.version,
          resource: GVRObj.resource,
        },
      },
    },
    onSubscriptionComplete: () => {
      handleLabelChange();
    },
    fetchPolicy: 'network-only',
  });

  /**
   * This useEffect is used to populate the namespace and
   * all the labels present in that particular namespace.
   */
  useEffect(() => {
    if (data !== undefined) {
      const appinfo: AppInfoData[] = [];
      const kubeData: KubeObjData[] = JSON.parse(data.getKubeObject.kube_obj);
      kubeData.forEach((obj: KubeObjData) => {
        const applabel: string[] = [];
        if (obj.data != null) {
          obj.data.forEach((objData: KubeObjResource) => {
            if (objData.labels != null) {
              Object.entries(objData.labels).map(([key, value]) =>
                applabel.push(`${key}=${value}`)
              );
            }
          });
        }
        appinfo.push({
          namespace: obj.namespace,
          appLabel: applabel,
        });
      });
      setAppInfoData(appinfo);
    }
  }, [data]);

  /**
   * This useEffect is called on the first render to fetch the
   * kubeObj data and populate it in the AutoComplete textfields
   */
  useEffect(() => {
    if (targetApp.appkind === 'deployment') {
      setGVRObj({
        group: 'apps',
        version: 'v1',
        resource: 'deployments',
      });
    } else if (targetApp.appkind === 'statefulset') {
      setGVRObj({
        group: 'apps',
        version: 'v1',
        resource: 'statefulsets',
      });
    } else if (targetApp.appkind === 'daemonset') {
      setGVRObj({
        group: 'apps',
        version: 'v1',
        resource: 'daemonsets',
      });
    } else if (targetApp.appkind === 'deploymentconfig') {
      setGVRObj({
        group: 'apps.openshift.io',
        version: 'v1',
        resource: 'deploymentconfigs',
      });
    } else if (targetApp.appkind === 'rollout') {
      setGVRObj({
        group: 'argoproj.io',
        version: 'v1alpha1',
        resource: 'rollouts',
      });
    } else {
      setGVRObj({
        group: '',
        version: '',
        resource: '',
      });
    }
  }, []);

  return (
    <div>
      <Typography className={classes.annotationInfo}>
        {t('createWorkflow.tuneWorkflow.verticalStepper.annotationInfo')}
      </Typography>
      <br />
      <div className={classes.inputDiv}>
        {/* Annotation Check  */}
        <div style={{ display: 'flex' }}>
          <Typography className={classes.annotation}>
            {t('createWorkflow.tuneWorkflow.verticalStepper.annotation')}
          </Typography>
          <ToggleButtonGroup
            value={targetApp.annotationCheck}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment"
          >
            <ToggleButton
              className={classes.annotationToggleBtn}
              style={{
                backgroundColor: targetApp.annotationCheck
                  ? theme.palette.success.main
                  : theme.palette.disabledBackground,
              }}
              value
              aria-label="left aligned"
            >
              <Typography
                style={{
                  color: targetApp.annotationCheck
                    ? theme.palette.common.white
                    : theme.palette.text.disabled,
                }}
                className={classes.text}
              >
                {t('createWorkflow.tuneWorkflow.verticalStepper.true')}
              </Typography>
            </ToggleButton>
            <ToggleButton
              style={{
                backgroundColor: !targetApp.annotationCheck
                  ? theme.palette.error.main
                  : theme.palette.disabledBackground,
              }}
              className={classes.annotationToggleBtn}
              value={false}
              aria-label="centered"
            >
              <Typography
                style={{
                  color: !targetApp.annotationCheck
                    ? theme.palette.common.white
                    : theme.palette.text.disabled,
                  textTransform: 'none',
                }}
                className={classes.text}
              >
                {t('createWorkflow.tuneWorkflow.verticalStepper.false')}
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <br />
        <Typography className={classes.annotationDesc}>
          {t('createWorkflow.tuneWorkflow.verticalStepper.annotationDesc')}
        </Typography>
        <br />
        <>
          {/* AutoComplete textfield for Namespace */}
          {engineManifest.spec.appinfo?.appns && (
            <Autocomplete
              id="combo-box-demo"
              options={appinfoData.map((option) => option.namespace)}
              freeSolo
              value={targetApp.appns}
              defaultValue={targetApp.appns}
              style={{ width: '100%' }}
              onChange={(_, v: any) => {
                setTargetApp({
                  ...targetApp,
                  appns: v,
                });
                handleLabelChange();
              }}
              renderInput={(params) => (
                <InputField
                  onChange={(event) => {
                    setTargetApp({
                      ...targetApp,
                      appns: event.target.value,
                    });
                  }}
                  {...params}
                  label="appns"
                />
              )}
            />
          )}
          <br />

          {/* AppKind MenuList */}
          {engineManifest.spec.appinfo?.appkind && (
            <FormControl variant="outlined">
              <InputLabel id="appKind" style={{ color: '#00000099' }}>
                {t('createWorkflow.tuneWorkflow.verticalStepper.appkind')}
              </InputLabel>
              <Select
                labelId="appKind"
                value={targetApp.appkind}
                onChange={(event) => {
                  setTargetApp({
                    ...targetApp,
                    appkind: event.target.value as string,
                  });
                  handleLabelChange();
                  if (event.target.value === 'deployment') {
                    setGVRObj({
                      group: 'apps',
                      version: 'v1',
                      resource: 'deployments',
                    });
                  } else if (event.target.value === 'statefulset') {
                    setGVRObj({
                      group: 'apps',
                      version: 'v1',
                      resource: 'statefulsets',
                    });
                  } else if (event.target.value === 'daemonset') {
                    setGVRObj({
                      group: 'apps',
                      version: 'v1',
                      resource: 'daemonsets',
                    });
                  } else if (event.target.value === 'deploymentconfig') {
                    setGVRObj({
                      group: 'apps.openshift.io',
                      version: 'v1',
                      resource: 'deploymentconfigs',
                    });
                  } else if (event.target.value === 'rollout') {
                    setGVRObj({
                      group: 'argoproj.io',
                      version: 'v1alpha1',
                      resource: 'rollouts',
                    });
                  } else {
                    setGVRObj({
                      group: '',
                      version: '',
                      resource: '',
                    });
                  }
                }}
                label="appKind"
              >
                <MenuItem aria-label="None" value="" />
                <MenuItem value="deployment">
                  {t('createWorkflow.tuneWorkflow.verticalStepper.deployment')}
                </MenuItem>
                <MenuItem value="statefulset">
                  {t('createWorkflow.tuneWorkflow.verticalStepper.statefulset')}
                </MenuItem>
                <MenuItem value="daemonset">
                  {t('createWorkflow.tuneWorkflow.verticalStepper.daemonset')}
                </MenuItem>
                <MenuItem value="deploymentconfig">
                  {t(
                    'createWorkflow.tuneWorkflow.verticalStepper.deploymentconfig'
                  )}
                </MenuItem>
                <MenuItem value="rollout">
                  {t('createWorkflow.tuneWorkflow.verticalStepper.rollout')}
                </MenuItem>
              </Select>
            </FormControl>
          )}
          <br />

          {/* AutoComplete textfield for applabel */}
          {engineManifest.spec.appinfo?.applabel && (
            <Autocomplete
              id="combo-box-demo"
              options={appLabel}
              freeSolo
              value={targetApp.applabel}
              defaultValue={targetApp.applabel}
              style={{ width: '100%' }}
              onChange={(_, v: any) => {
                setTargetApp({
                  ...targetApp,
                  applabel: v,
                });
              }}
              renderInput={(params) => (
                <InputField
                  onChange={(event) => {
                    setTargetApp({
                      ...targetApp,
                      applabel: event.target.value,
                    });
                  }}
                  {...params}
                  label="applabel"
                />
              )}
            />
          )}
          <br />

          {/* JobCleanUpPolicy textfield */}
          <InputField
            label="jobCleanUpPolicy"
            width="auto"
            value={targetApp.jobCleanUpPolicy}
            onChange={(event) => {
              setTargetApp({
                ...targetApp,
                jobCleanUpPolicy: event.target.value,
              });
            }}
          />
          <br />

          {/* Checkbox for adding NodeSelector */}
          <FormControlLabel
            control={
              <Checkbox
                checked={addNodeSelector}
                onChange={(event) => {
                  return setAddNodeSelector(event.target.checked);
                }}
                className={classes.checkBoxDefault}
                name="checkedB"
                color="primary"
              />
            }
            label={
              <Typography className={classes.checkBoxText}>
                {t('createWorkflow.tuneWorkflow.verticalStepper.nodeselector')}
              </Typography>
            }
          />
          {addNodeSelector && (
            <div style={{ display: 'flex' }}>
              <Typography style={{ marginTop: 15, marginRight: 5 }}>
                {t('createWorkflow.tuneWorkflow.verticalStepper.selector')}
              </Typography>
              <InputField
                label="nodeselector"
                width="50%"
                value={nodeSelector}
                onChange={(event) => {
                  setNodeSelector(event.target.value);
                }}
              />
            </div>
          )}
        </>
      </div>
      <br />

      <div>
        {isCustom && (
          <Button onClick={() => gotoStep(0)} className={classes.button}>
            {t('workflowStepper.back')}
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleMainYAMLChange()}
          className={classes.button}
        >
          {t('workflowStepper.next')}
        </Button>
      </div>
    </div>
  );
};

export default TargetApplication;
