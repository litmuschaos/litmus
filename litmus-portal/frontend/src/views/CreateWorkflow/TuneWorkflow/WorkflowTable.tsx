/* eslint-disable no-const-assign */
import { IconButton, Typography, useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import Row from '../../../containers/layouts/Row';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { experimentMap } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import parsed, { updateManifestImage } from '../../../utils/yamlUtils';
import ConfigurationStepper from './ConfigurationStepper/ConfigurationStepper';
import useStyles from './styles';

interface WorkflowTableProps {
  isCustom: boolean | undefined;
  namespace: string;
}

interface ChaosCRDTable {
  StepIndex: number;
  Name: string;
  Namespace: string;
  Application: string;
  Probes: number;
  ChaosEngine: string;
}

const WorkflowTable = forwardRef(
  ({ isCustom, namespace }: WorkflowTableProps, ref) => {
    const classes = useStyles();
    const { t } = useTranslation();

    const theme = useTheme();
    const workflow = useActions(WorkflowActions);
    const [experiments, setExperiments] = useState<ChaosCRDTable[]>([]);
    const [revertChaos, setRevertChaos] = useState<boolean>(true);
    const [displayStepper, setDisplayStepper] = useState<boolean>(false);
    const [engineIndex, setEngineIndex] = useState<number>(0);
    const [selected, setSelected] = useState<string>('');
    const manifest = useSelector(
      (state: RootState) => state.workflowManifest.manifest
    );
    const imageRegistryData = useSelector(
      (state: RootState) => state.selectedImageRegistry
    );
    const addWeights = (manifest: string) => {
      const arr: experimentMap[] = [];
      const hashMap = new Map();
      const tests = parsed(manifest);
      tests.forEach((test) => {
        let value = 10;
        if (hashMap.has(test)) {
          value = hashMap.get(test);
        }
        arr.push({ experimentName: test, weight: value });
      });
      localforage.setItem('weights', arr);
    };

    const parsing = (yamlText: string) => {
      const parsedYaml = YAML.parse(yamlText);
      const expData: ChaosCRDTable[] = [];
      addWeights(manifest);

      const extractInfo = (template: any, index: number) => {
        if (template.inputs && template.inputs.artifacts) {
          template.inputs.artifacts.forEach((artifact: any) => {
            const chaosEngine = YAML.parse(artifact.raw.data);
            if (chaosEngine.kind === 'ChaosEngine') {
              expData.push({
                StepIndex: index,
                Name: chaosEngine.metadata.generateName,
                Namespace: chaosEngine.spec.appinfo?.appns
                  .toLowerCase()
                  .includes('namespace')
                  ? namespace
                  : chaosEngine.spec.appinfo?.appns ?? '',
                Application: chaosEngine.spec.appinfo?.applabel ?? '',
                Probes: chaosEngine.spec.experiments[0].spec.probe?.length ?? 0,
                ChaosEngine: artifact.raw.data,
              });
            }
          });
        }
      };

      if (parsedYaml.kind === 'Workflow') {
        parsedYaml.spec.templates.forEach((template: any, index: number) => {
          extractInfo(template, index);
        });
      } else if (parsedYaml.kind === 'CronWorkflow') {
        parsedYaml.spec.workflowSpec.templates.forEach(
          (template: any, index: number) => {
            extractInfo(template, index);
          }
        );
      }
      setExperiments(expData);
    };

    // Revert Chaos
    const toggleRevertChaos = (manifest: string) => {
      const parsedYAML = YAML.parse(manifest);
      let deleteEngines: string = '';

      // Else if Revert Chaos is set to true and it is not already set in the manifest
      // For Workflows
      if (revertChaos && parsedYAML.kind === 'Workflow') {
        parsedYAML.spec.podGC = {
          strategy: 'OnWorkflowCompletion',
        };
        parsedYAML.spec.templates[0].steps.push([
          {
            name: 'revert-chaos',
            template: 'revert-chaos',
          },
        ]);

        parsed(manifest).forEach((_, i) => {
          deleteEngines += `${
            YAML.parse(
              parsedYAML.spec.templates[2 + i].inputs.artifacts[0].raw.data
            ).metadata.labels['instance_id']
          }, `;
        });

        parsedYAML.spec.templates[parsedYAML.spec.templates.length] = {
          name: 'revert-chaos',
          container: {
            image: 'litmuschaos/k8s:latest',
            command: ['sh', '-c'],
            args: [
              `kubectl delete chaosengine -l 'instance_id in (${deleteEngines})' -n {{workflow.parameters.adminModeNamespace}} `,
            ],
          },
        };
      }

      // Else if Revert Chaos is set to True and it is not already set in the manifest
      // For Cron Workflow
      else if (revertChaos && parsedYAML.kind === 'CronWorkflow') {
        parsedYAML.spec.workflowSpec.podGC = {
          strategy: 'OnWorkflowCompletion',
        };
        parsedYAML.spec.workflowSpec.templates[0].steps.push([
          {
            name: 'revert-chaos',
            template: 'revert-chaos',
          },
        ]);

        parsed(manifest).forEach((_, i) => {
          deleteEngines = `${
            deleteEngines +
            YAML.parse(
              parsedYAML.spec.workflowSpec.templates[2 + i].inputs.artifacts[0]
                .raw.data
            ).metadata.name
          } `;
        });

        deleteEngines += '-n {{workflow.parameters.adminModeNamespace}}';

        parsedYAML.spec.workflowSpec.templates[
          parsedYAML.spec.workflowSpec.templates.length
        ] = {
          name: 'revert-chaos',
          container: {
            image: 'litmuschaos/k8s:latest',
            command: ['sh', '-c'],
            args: [deleteEngines],
          },
        };
      }

      const updatedManifest = updateManifestImage(
        parsedYAML,
        imageRegistryData
      );
      workflow.setWorkflowManifest({
        manifest: updatedManifest,
      });
    };

    const closeConfigurationStepper = () => {
      workflow.setWorkflowManifest({
        engineYAML: '',
      });
      setDisplayStepper(false);
    };

    const handleChange = (
      event: React.MouseEvent<HTMLElement>,
      newValue: boolean
    ) => {
      setRevertChaos(newValue);
    };

    useEffect(() => {
      if (manifest.length) {
        parsing(manifest);
      }
      localforage.getItem('selectedScheduleOption').then((value) => {
        if (value) {
          setSelected((value as ChooseWorkflowRadio).selected);
        } else setSelected('');
      });
    }, [manifest]);

    const deleteExperiment = (experimentIndex: number) => {
      /**
       * Workflow manifest saved in redux state
       */
      const wfManifest = YAML.parse(manifest);

      /**
       * Get template name according to the experiment index
       */
      const templateName = wfManifest.spec.templates[experimentIndex].name;

      /**
       * Get instance_id of Chaos Engines
       */
      const selectedEngine =
        wfManifest.spec.templates[experimentIndex].inputs.artifacts[0];
      const { instance_id } = YAML.parse(
        selectedEngine.raw.data
      ).metadata.labels;

      /**
       * if the template is a revert-chaos template
       * the engine name is removed from the
       * revert-chaos template args
       */
      if (
        wfManifest.spec.templates[
          wfManifest.spec.templates.length - 1
        ].name.includes('revert-')
      ) {
        const argument = wfManifest.spec.templates[
          wfManifest.spec.templates.length - 1
        ].container.args[0].replace(`${instance_id}, `, '');
        wfManifest.spec.templates[
          wfManifest.spec.templates.length - 1
        ].container.args[0] = argument;
      }

      /**
       * Remove the experiment name from steps
       */
      wfManifest.spec.templates[0].steps.forEach(
        (data: any, stepIndex: number) => {
          data.forEach((step: any, index: number) => {
            if (step.name === templateName) {
              data.splice(index, 1);
            }
          });
          if (data.length === 0) {
            wfManifest.spec.templates[0].steps.splice(stepIndex, 1);
          }
        }
      );

      /**
       * Remove the chaos engine from the overall manifest
       * according to the experiment index
       */
      wfManifest.spec.templates.splice(experimentIndex, 1);

      /**
       * Set the updated manifest to redux state
       */
      workflow.setWorkflowManifest({
        manifest: YAML.stringify(wfManifest),
        engineYAML: '',
      });
    };

    function onNext() {
      if (experiments.length === 0) {
        return false; // Should show alert
      }
      if (!isCustom) {
        return true;
      }
      if (selected === 'C') {
        toggleRevertChaos(manifest);
      }
      return true; // Should not show any alert
    }

    useImperativeHandle(ref, () => ({
      onNext,
    }));

    return (
      <div>
        {!displayStepper ? (
          <>
            <TableContainer className={classes.table} component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {t('createWorkflow.chooseWorkflow.table.head1')}
                    </TableCell>
                    <TableCell align="left">
                      {t('createWorkflow.chooseWorkflow.table.head2')}
                    </TableCell>
                    <TableCell align="left">
                      {t('createWorkflow.chooseWorkflow.table.head3')}
                    </TableCell>
                    <TableCell align="left">
                      {t('createWorkflow.chooseWorkflow.table.head4')}
                    </TableCell>
                    <TableCell align="left">
                      {t('createWorkflow.chooseWorkflow.table.head5')}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {experiments.length > 0 ? (
                    experiments.map((experiment: ChaosCRDTable, index) => (
                      <TableRow key={experiment.Name}>
                        <TableCell component="th" scope="row">
                          {index + 1}
                        </TableCell>
                        <TableCell
                          className={classes.selection}
                          align="left"
                          onClick={() => {
                            setDisplayStepper(true);
                            setEngineIndex(experiment.StepIndex);
                            workflow.setWorkflowManifest({
                              engineYAML: experiment.ChaosEngine,
                            });
                          }}
                        >
                          {experiment.Name}
                        </TableCell>
                        <TableCell align="left">
                          {experiment.Namespace}
                        </TableCell>
                        <TableCell align="left">
                          {experiment.Application}
                        </TableCell>
                        <TableCell align="left">{experiment.Probes}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() =>
                              deleteExperiment(experiment.StepIndex)
                            }
                          >
                            <img
                              src="./icons/bin-red.svg"
                              alt="delete experiment"
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography align="center">
                          {t('createWorkflow.chooseWorkflow.pleaseAddExp')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {selected === 'C' && (
              <TableContainer className={classes.revertChaos} component={Paper}>
                <Row className={classes.wrapper}>
                  <div className={classes.key}>
                    <Typography>
                      {t('createWorkflow.chooseWorkflow.revertSchedule')}
                    </Typography>
                  </div>
                  <div>
                    <ToggleButtonGroup
                      value={revertChaos}
                      exclusive
                      onChange={handleChange}
                      aria-label="text alignment"
                    >
                      <ToggleButton
                        value
                        style={{
                          backgroundColor: revertChaos
                            ? theme.palette.success.main
                            : theme.palette.disabledBackground,
                          color: revertChaos
                            ? theme.palette.common.white
                            : theme.palette.text.disabled,
                        }}
                        aria-label="centered"
                      >
                        {t('createWorkflow.chooseWorkflow.trueValue')}
                      </ToggleButton>
                      <ToggleButton
                        value={false}
                        style={{
                          backgroundColor: !revertChaos
                            ? theme.palette.error.main
                            : theme.palette.disabledBackground,
                          color: !revertChaos
                            ? theme.palette.common.white
                            : theme.palette.text.disabled,
                        }}
                        aria-label="centered"
                      >
                        {t('createWorkflow.chooseWorkflow.falseValue')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                </Row>
              </TableContainer>
            )}
          </>
        ) : (
          <ConfigurationStepper
            experimentIndex={engineIndex}
            closeStepper={closeConfigurationStepper}
            isCustom={isCustom}
          />
        )}
      </div>
    );
  }
);

export default WorkflowTable;
