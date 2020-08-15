import { Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';
import LinearProgressBar from '../ProgressBar/LinearProgressBar';
import ToggleComponent from '../ToggleComponent';
import useStyles from './styles';
import InfoTooltip from '../InfoTooltip';
import Center from '../../containers/layouts/Center';

function createData(
  name: string,
  result: JSX.Element,
  weight: number | number[],
  points: number
) {
  return { name, result, weight, points };
}

interface ResultModalProps {
  testValue: (number | number[])[];
  testNames: (string | string[])[];
}
const ResultTable: React.FC<ResultModalProps> = ({ testValue, testNames }) => {
  const classes = useStyles();

  const rows: {
    name: string;
    result: JSX.Element;
    weight: number | number[];
    points: number;
  }[] = [];
  testNames.map((element: any, index: any) =>
    rows.push(
      createData(
        `${testNames[index]} test`,
        <div>
          <ToggleComponent />
        </div>,
        testValue[index],
        9 // dummy result value
      )
    )
  );

  return (
    <div>
      <Center>
        <div className={classes.toolTipGroup}>
          <div className={classes.tableHeader}>
            <Typography className={classes.headingModal}>
              <strong>
                Simulate the workflow run and see the suggested reliability
                score
              </strong>
            </Typography>
            <Typography className={classes.headingModal}>
              <strong>
                (workflow1 K8S conformance test on Ignite cluster)
              </strong>
            </Typography>
          </div>
          <div className={classes.toolTip1}>
            <InfoTooltip value="Text Default" />
          </div>
        </div>
      </Center>
      <TableContainer>
        <Center>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeading}>
                  Test Name
                </TableCell>
                <TableCell align="center" className={classes.tableHeadingLine}>
                  Test Result
                </TableCell>
                <TableCell align="center" className={classes.tableHeading}>
                  Weight of test
                </TableCell>
                <TableCell align="center" className={classes.tableHeading}>
                  Test Points
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell
                    component="th"
                    scope="row"
                    className={classes.tableData}
                  >
                    {row.name}
                  </TableCell>
                  <TableCell align="left" className={classes.testResult}>
                    {row.result}
                  </TableCell>
                  <TableCell align="left" className={classes.tableWeight}>
                    {row.weight}
                    &nbsp; points
                    <br />
                    <div className={classes.progressBar}>
                      <LinearProgressBar value={row.weight} />
                    </div>
                  </TableCell>
                  <TableCell align="left" className={classes.tablePoints}>
                    {row.points}
                    &nbsp; points
                    <br />
                    <div className={classes.progressBar}>
                      <LinearProgressBar value={row.points} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Center>
      </TableContainer>
      <div className={classes.mainResultDiv}>
        <Center>
          <div className={classes.resultDiv}>
            <div className={classes.toolTipGroup}>
              <Typography className={classes.resultText}>
                Total Score
              </Typography>
              <div className={classes.toolTip2}>
                <InfoTooltip value="Text Default" />
              </div>
            </div>
            <Typography className={classes.totalScore}>
              <strong>
                {rows.map((e) => e.points).reduce((prev, curr) => prev + curr)}
                /32
              </strong>
            </Typography>
          </div>
          <div className={classes.resultDiv}>
            <div className={classes.toolTipGroup}>
              <Typography className={classes.resultText}>
                Reliability score
              </Typography>
              <div className={classes.toolTip3}>
                <InfoTooltip value="Text Default" />
              </div>
            </div>
            <Typography className={classes.reliabilityScore}>
              <strong>70%</strong>
            </Typography>
          </div>
          <div className={classes.resultDiv}>
            <Typography className={classes.resultTextInfo}>
              Tips from Litmus Portal:
            </Typography>
            <Typography className={classes.testTips}>
              When you set the test result, then pay attention to the total
              values of the total score. This will help you in setting up your
              tests, getting the maximum result and the correct operation of the
              test in the future.
            </Typography>
          </div>
        </Center>
      </div>
    </div>
  );
};

export default ResultTable;
