/* eslint-disable no-const-assign */
import {
  IconButton,
  Popover,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import InfoIcon from '@material-ui/icons/Info';
import { Icon } from 'litmus-ui';
import localforage from 'localforage';
import React, {
  forwardRef,
  lazy,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import SwitchButton from '../../../components/SwitchButton';
import Row from '../../../containers/layouts/Row';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { experimentMap } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import parsed, {
  extractEngineNames,
  updateManifestImage,
} from '../../../utils/yamlUtils';
import useStyles from './styles';

const ConfigurationStepper = lazy(
  () => import('./ConfigurationStepper/ConfigurationStepper')
);
const AdvanceTuning = lazy(() => import('./AdvanceTuning/index'));

interface WorkflowTableProps {
  isCustom: boolean | undefined;
  namespace: string;
}

interface ChaosCRDTable {
  SequenceNo: number;
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
    const [revertChaos, setRevertChaos] = useState<boolean>(false);
    const [displayStepper, setDisplayStepper] = useState<boolean>(false);
    const [displayAdvanceTune, setDisplayAdvanceTune] =
      useState<boolean>(false);
    const [engineIndex, setEngineIndex] = useState<number>(0);
    const [selected, setSelected] = useState<string>('');
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const manifest = useSelector(
      (state: RootState) => state.workflowManifest.manifest
    );
    const imageRegistryData = useSelector(
      (state: RootState) => state.selectedImageRegistry
    );
    const { version } = useSelector(
      (state: RootState) => state.litmusCoreVersion
    );

    /**
     * State variables to manage popover actions
     */
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
      null
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const addWeights = (manifest: string) => {
      const arr: experimentMap[] = [];
      const hashMap = new Map();
      const tests = extractEngineNames(manifest);
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

      const extractInfo = (template: any, steps: any, index: number) => {
        if (template.inputs && template.inputs.artifacts) {
          template.inputs.artifacts.forEach((artifact: any) => {
            const chaosEngine = YAML.parse(artifact.raw.data);
            if (chaosEngine.kind === 'ChaosEngine') {
              let sqnNo = 1;
              steps.forEach((step: any, index: number) => {
                step.forEach((value: any) => {
                  if (value.name === template.name) {
                    sqnNo = index;
                  }
                });
              });
              expData.push({
                SequenceNo: sqnNo,
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
          extractInfo(template, parsedYaml.spec.templates[0].steps, index);
        });
      } else if (parsedYaml.kind === 'CronWorkflow') {
        parsedYaml.spec.workflowSpec.templates.forEach(
          (template: any, index: number) => {
            extractInfo(
              template,
              parsedYaml.spec.workflowSpec.templates[0].steps,
              index
            );
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
            image: `litmuschaos/k8s:${version}`,
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
            image: `litmuschaos/k8s:${version}`,
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

    const handleChange = () => {
      setRevertChaos(!revertChaos);
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

    useEffect(() => {
      if (experiments.length > 0) {
        setEditOpen(true);
        setTimeout(() => setEditOpen(false), 6000);
      }
    }, [experiments]);

    const deleteExperiment = (experimentIndex: number) => {
      /**
       * Workflow manifest saved in redux state
       */
      const wfManifest = YAML.parse(manifest);

      /**
       * Get template name according to the experiment index
       */
      const templateName =
        wfManifest.kind.toLowerCase() === 'workflow'
          ? wfManifest.spec.templates[experimentIndex].name
          : wfManifest.spec.workflowSpec.templates[experimentIndex].name;

      /**
       * Get instance_id of Chaos Engines
       */
      const selectedEngine =
        wfManifest.kind.toLowerCase() === 'workflow'
          ? wfManifest.spec.templates[experimentIndex].inputs.artifacts[0]
          : wfManifest.spec.workflowSpec.templates[experimentIndex].inputs
              .artifacts[0];
      const { instance_id } = YAML.parse(selectedEngine.raw.data).metadata
        .labels;

      /**
       * if the template is a revert-chaos template
       * the engine name is removed from the
       * revert-chaos template args
       */
      const spec =
        wfManifest.kind.toLowerCase() === 'workflow'
          ? wfManifest.spec
          : wfManifest.spec.workflowSpec;
      if (spec.templates[spec.templates.length - 1].name.includes('revert-')) {
        const argument = spec.templates[
          spec.templates.length - 1
        ].container.args[0].replace(`${instance_id}, `, '');
        spec.templates[spec.templates.length - 1].container.args[0] = argument;
      }

      /**
       * Remove the experiment name from steps
       */
      spec.templates[0].steps.forEach((data: any, stepIndex: number) => {
        data.forEach((step: any, index: number) => {
          if (step.name === templateName) {
            data.splice(index, 1);
          }
        });
        if (data.length === 0) {
          spec.templates[0].steps.splice(stepIndex, 1);
        }
      });

      /**
       * Remove the chaos engine from the overall manifest
       * according to the experiment index
       */
      spec.templates.splice(experimentIndex, 1);

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

    function configurationStepperRef() {
      if (displayStepper) {
        return false; // Should show alert
      }
      return true;
    }

    useImperativeHandle(ref, () => ({
      onNext,
      configurationStepperRef,
    }));

    return (
      <div>
        {!displayStepper && !displayAdvanceTune ? (
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
                    <TableCell className={classes.emptyCell} />
                    <TableCell className={classes.emptyCell} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {experiments.length > 0 ? (
                    experiments
                      .sort((a, b) => {
                        return a.SequenceNo - b.SequenceNo;
                      })
                      .map((experiment: ChaosCRDTable, index) => (
                        <TableRow
                          style={{ position: 'relative' }}
                          key={experiment.Name}
                        >
                          <TableCell component="th" scope="row">
                            {experiment.SequenceNo -
                              experiments[0].SequenceNo +
                              1}
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
                          <TableCell align="left">
                            {experiment.Probes}
                          </TableCell>
                          <TableCell>
                            {editOpen && index === experiments.length - 1 ? (
                              <Tooltip
                                arrow
                                TransitionComponent={Zoom}
                                open={editOpen}
                                placement="bottom-start"
                                className={classes.tooltip}
                                title="Click here to edit the Chaos Experiment"
                                onClose={() => setEditOpen(false)}
                              >
                                <IconButton
                                  onClick={() => {
                                    setDisplayStepper(true);
                                    setEngineIndex(experiment.StepIndex);
                                    workflow.setWorkflowManifest({
                                      engineYAML: experiment.ChaosEngine,
                                    });
                                  }}
                                  size="medium"
                                >
                                  <Icon
                                    name="pencil"
                                    size="md"
                                    color={theme.palette.primary.main}
                                  />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <IconButton
                                onClick={() => {
                                  setDisplayStepper(true);
                                  setEngineIndex(experiment.StepIndex);
                                  workflow.setWorkflowManifest({
                                    engineYAML: experiment.ChaosEngine,
                                  });
                                }}
                                size="medium"
                              >
                                <Icon
                                  name="pencil"
                                  size="md"
                                  color={theme.palette.primary.main}
                                />
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() =>
                                deleteExperiment(experiment.StepIndex)
                              }
                              size="medium"
                            >
                              <Icon
                                name="trash"
                                size="md"
                                color={theme.palette.error.main}
                              />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7}>
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
              <>
                <TableContainer
                  className={classes.revertChaos}
                  component={Paper}
                >
                  <Row className={classes.advanceTune}>
                    <div className={classes.key}>
                      <div>
                        <div style={{ display: 'flex' }}>
                          <Typography className={classes.advanceText}>
                            {t('createWorkflow.chooseWorkflow.revertSchedule')}
                          </Typography>
                          <IconButton
                            className={classes.iconBtn}
                            onClick={handleClick}
                            aria-label="info"
                          >
                            <InfoIcon />
                          </IconButton>
                          <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'center',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'center',
                            }}
                          >
                            <Typography className={classes.infoText}>
                              {t('createWorkflow.chooseWorkflow.retainLogs')}
                            </Typography>
                          </Popover>
                        </div>
                        <Typography className={classes.advanceDesc}>
                          {t('createWorkflow.chooseWorkflow.retainLogsDesc')}
                        </Typography>
                      </div>
                    </div>
                    <div data-cy="revertChaosSwitch">
                      <SwitchButton
                        checked={revertChaos}
                        handleChange={handleChange}
                      />
                    </div>
                  </Row>
                </TableContainer>
                <TableContainer
                  className={classes.revertChaos}
                  component={Paper}
                >
                  <Row className={classes.wrapper}>
                    <div className={classes.advanceTune}>
                      <div>
                        <Typography className={classes.advanceText}>
                          {t('createWorkflow.chooseWorkflow.advance')}
                        </Typography>
                        <Typography className={classes.advanceDesc}>
                          {t('createWorkflow.chooseWorkflow.advanceDesc')}
                        </Typography>
                      </div>
                      <div>
                        <IconButton
                          className={classes.tuneBtn}
                          onClick={() => setDisplayAdvanceTune(true)}
                        >
                          <Icon name="chevronRight" />
                        </IconButton>
                      </div>
                    </div>
                  </Row>
                </TableContainer>
              </>
            )}
          </>
        ) : displayStepper && !displayAdvanceTune ? (
          <ConfigurationStepper
            experimentIndex={engineIndex}
            closeStepper={closeConfigurationStepper}
            isCustom={isCustom}
          />
        ) : !displayStepper && displayAdvanceTune ? (
          <AdvanceTuning
            closeAdvanceTuning={() => {
              setDisplayAdvanceTune(false);
            }}
          />
        ) : (
          <></>
        )}
      </div>
    );
  }
);

export default WorkflowTable;
