import { Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { experimentMap } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import parsed from '../../../utils/yamlUtils';
import ConfigurationStepper from './ConfigurationStepper/ConfigurationStepper';
import useStyles from './styles';

interface WorkflowTableProps {
  isCustom?: boolean;
}

interface ChaosCRDTable {
  StepIndex: number;
  Name: string;
  Namespace: string;
  Application: string;
  Probes: number;
  ChaosEngine: string;
}

const WorkflowTable: React.FC<WorkflowTableProps> = ({ isCustom }) => {
  const classes = useStyles();
  const workflow = useActions(WorkflowActions);
  const [experiments, setExperiments] = useState<ChaosCRDTable[]>([]);
  const [displayStepper, setDisplayStepper] = useState<boolean>(false);
  const [engineIndex, setEngineIndex] = useState<number>(0);
  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
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
    workflow.setWorkflowManifest({
      manifest: yamlText,
    });
    addWeights(manifest);
    parsedYaml.spec.templates.forEach((template: any, index: number) => {
      if (template.inputs !== undefined) {
        template.inputs.artifacts.forEach((artifact: any) => {
          const chaosEngine = YAML.parse(artifact.raw.data);
          if (chaosEngine.kind === 'ChaosEngine') {
            expData.push({
              StepIndex: index,
              Name: chaosEngine.metadata.name,
              Namespace: chaosEngine.spec.appinfo.appns,
              Application: chaosEngine.spec.appinfo.applabel,
              Probes: chaosEngine.spec.experiments[0].spec.probe?.length || 0,
              ChaosEngine: artifact.raw.data,
            });
          }
        });
      }
    });
    setExperiments(expData);
  };

  const closeConfigurationStepper = () => {
    setDisplayStepper(false);
  };

  useEffect(() => {
    if (manifest.length) {
      parsing(manifest);
    }
  }, [manifest]);

  useEffect(() => {}, []);

  return (
    <div>
      {!displayStepper ? (
        <TableContainer className={classes.table} component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Sequence</TableCell>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">Namespace</TableCell>
                <TableCell align="left">Application</TableCell>
                <TableCell align="left">Probes</TableCell>
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
                      onClick={() => {
                        setDisplayStepper(true);
                        setEngineIndex(experiment.StepIndex);
                        workflow.setWorkflowManifest({
                          engineYAML: experiment.ChaosEngine,
                        });
                      }}
                      align="left"
                      style={{ cursor: 'pointer' }}
                    >
                      {experiment.Name}
                    </TableCell>
                    <TableCell align="left">{experiment.Namespace}</TableCell>
                    <TableCell align="left">{experiment.Application}</TableCell>
                    <TableCell align="left">{experiment.Probes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography align="center">
                      Please add experiments to see the data
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <ConfigurationStepper
          experimentIndex={engineIndex}
          closeStepper={closeConfigurationStepper}
          isCustom={isCustom}
        />
      )}
    </div>
  );
};

export default WorkflowTable;
