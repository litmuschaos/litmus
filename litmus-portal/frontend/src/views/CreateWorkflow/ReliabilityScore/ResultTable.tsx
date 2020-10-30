import { Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoTooltip from '../../../components/InfoTooltip';
import Center from '../../../containers/layouts/Center';
import LinearProgressBar from '../../../components/ProgressBar/LinearProgressBar';
import ToggleComponent from '../ToggleComponent';
import useStyles from './styles';

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
  const { t } = useTranslation();

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
                {t('createWorkflow.reliabilityScore.resultTable.header')}
              </strong>
            </Typography>
            <Typography className={classes.headingModal}>
              <strong>
                ({t('createWorkflow.reliabilityScore.resultTable.headerDesc')})
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
                  {t(
                    'createWorkflow.reliabilityScore.resultTable.tableCell.testName'
                  )}
                </TableCell>
                <TableCell align="center" className={classes.tableHeadingLine}>
                  {t(
                    'createWorkflow.reliabilityScore.resultTable.tableCell.testResult'
                  )}
                </TableCell>
                <TableCell align="center" className={classes.tableHeading}>
                  {t(
                    'createWorkflow.reliabilityScore.resultTable.tableCell.testWeight'
                  )}
                </TableCell>
                <TableCell align="center" className={classes.tableHeading}>
                  {t(
                    'createWorkflow.reliabilityScore.resultTable.tableCell.testPoints'
                  )}
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
                    &nbsp;{' '}
                    {t('createWorkflow.reliabilityScore.resultTable.points')}
                    <br />
                    <div className={classes.progressBar}>
                      <LinearProgressBar width={2} value={row.weight} />
                    </div>
                  </TableCell>
                  <TableCell align="left" className={classes.tablePoints}>
                    {row.points}
                    &nbsp;{' '}
                    {t('createWorkflow.reliabilityScore.resultTable.points')}
                    <br />
                    <div className={classes.progressBar}>
                      <LinearProgressBar width={2} value={row.points} />
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
                {t('createWorkflow.reliabilityScore.resultTable.totalScore')}
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
                {t(
                  'createWorkflow.reliabilityScore.resultTable.reliabilityScore'
                )}
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
              {t('createWorkflow.reliabilityScore.resultTable.info')}
            </Typography>
            <Typography className={classes.testTips}>
              {t('createWorkflow.reliabilityScore.resultTable.tips')}
            </Typography>
          </div>
        </Center>
      </div>
    </div>
  );
};

export default ResultTable;
