import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React, { useEffect, useState } from 'react';
import YAML from 'yaml';
import ConfigurationStepper from './ConfigurationStepper/ConfigurationStepper';

interface WorkflowTableProps {
  crd: string;
}

interface ChaosCRDTable {
  Name: string;
  Namespace: string;
  Application: string;
  Probes: number;
  ChaosEngine: string;
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const WorkflowTable: React.FC<WorkflowTableProps> = ({ crd }) => {
  const classes = useStyles();
  const [experiments, setExperiments] = useState<ChaosCRDTable[]>([]);
  const [displayStepper, setDisplayStepper] = useState<boolean>(false);
  const [
    configureExperiment,
    setConfigureExperiment,
  ] = useState<ChaosCRDTable>();
  const fetchYaml = (link: string) => {
    fetch(link)
      .then((data) => {
        data.text().then((yamlText) => {
          const parsedYaml = YAML.parse(yamlText);
          const expData: ChaosCRDTable[] = [];
          parsedYaml.spec.templates.forEach((template: any) => {
            if (template.inputs !== undefined) {
              template.inputs.artifacts.forEach((artifact: any) => {
                const chaosEngine = YAML.parse(artifact.raw.data);
                if (chaosEngine.kind === 'ChaosEngine') {
                  expData.push({
                    Name: chaosEngine.metadata.name,
                    Namespace: chaosEngine.spec.appinfo.appns,
                    Application: chaosEngine.spec.appinfo.applabel,
                    Probes:
                      chaosEngine.spec.experiments[0].spec.probe?.length || 0,
                    ChaosEngine: artifact.raw.data,
                  });
                }
              });
            }
          });
          setExperiments(expData);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const closeConfigurationStepper = () => {
    setDisplayStepper(false);
  };

  useEffect(() => {
    if (crd.length) {
      fetchYaml(crd);
    }
  }, [crd]);

  return (
    <div>
      {!displayStepper ? (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
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
              {experiments.map((experiment: ChaosCRDTable, index) => (
                <TableRow key={experiment.Name}>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setDisplayStepper(true);
                      setConfigureExperiment(experiment);
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <ConfigurationStepper
          experimentData={configureExperiment}
          closeStepper={closeConfigurationStepper}
        />
      )}
    </div>
  );
};

export default WorkflowTable;
