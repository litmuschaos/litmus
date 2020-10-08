/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import {
  MuiThemeProvider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from '@material-ui/core';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useTheme from '@material-ui/core/styles/useTheme';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import {
  customThemeAnalyticsTable,
  customThemeAnalyticsTableCompareMode,
} from '../../../../theme';
import {
  sortAlphaAsc,
  sortAlphaDesc,
  sortNumAsc,
  sortNumDesc,
} from '../../../../utils/sort';
import { SCHEDULE_DETAILS } from '../../../../graphql/quries';
import {
  Schedules,
  ScheduleDataVars,
  ScheduleWorkflow,
} from '../../../../models/graphql/scheduleData';
import { RootState } from '../../../../redux/reducers';
import Loader from '../../../../components/Loader';
import ResilienceScoreComparisonPlot from '../WorkflowComparisonPlot/index';
import useStyles from './styles';
import TableData from './TableData';
import TableHeader from './TableHeader';
import TableToolBar from './TableToolbar';

interface RangeType {
  startDate: string;
  endDate: string;
}

interface SortData {
  startDate: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  cluster: { sort: boolean; ascending: boolean };
}

interface Filter {
  range: RangeType;
  selectedCluster: string;
  sortData: SortData;
  searchTokens: string[];
}

const WorkflowComparisonTable = () => {
  const classes = useStyles();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<Filter>({
    range: { startDate: 'all', endDate: 'all' },
    selectedCluster: 'All',
    sortData: {
      name: { sort: false, ascending: true },
      startDate: { sort: true, ascending: true },
      cluster: { sort: false, ascending: true },
    },
    searchTokens: [''],
  });
  const [displayData, setDisplayData] = useState<ScheduleWorkflow[]>([]);
  const [clusters, setClusters] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selected, setSelected] = React.useState<string[]>([]);
  const isSelected = (name: string) => selected.indexOf(name) !== -1;
  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, displayData.length - page * rowsPerPage);
  const [compare, setCompare] = React.useState<Boolean>(false);
  const [showAll, setShowAll] = React.useState<Boolean>(true);

  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Apollo query to get the scheduled data
  const { data, loading, error } = useQuery<Schedules, ScheduleDataVars>(
    SCHEDULE_DETAILS,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const getClusters = (searchingData: ScheduleWorkflow[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.cluster_name)) {
        uniqueList.push(data.cluster_name);
      }
    });
    setClusters(uniqueList);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = displayData.map(
        (n: ScheduleWorkflow) => n.workflow_id
      );
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const searchingDataRetriever = () => {
    let searchingData: ScheduleWorkflow[] = [];
    if (compare === false) {
      searchingData = data?.getScheduledWorkflows ?? [];
    } else {
      const searchedData: ScheduleWorkflow[] = [];
      selected.forEach((workflowID) => {
        data?.getScheduledWorkflows.forEach((workflow) => {
          if (workflow.workflow_id === workflowID) {
            searchedData.push(workflow);
          }
        });
      });
      searchingData = searchedData;
    }
    return searchingData;
  };

  const CallbackForComparing = (compareWorkflows: boolean) => {
    setCompare(compareWorkflows);
    const payload: ScheduleWorkflow[] = [];
    selected.forEach((workflow) => {
      displayData.forEach((displayWorkflow, i) => {
        if (displayWorkflow.workflow_id === workflow && data) {
          payload.push(data?.getScheduledWorkflows[i]);
        }
      });
    });
    setDisplayData(payload);
  };

  useEffect(() => {
    setDisplayData(data ? data?.getScheduledWorkflows : []);
    getClusters(data ? data?.getScheduledWorkflows : []);
  }, [data]);

  useEffect(() => {
    const payload = searchingDataRetriever()
      .filter((wkf: ScheduleWorkflow) => {
        return filter.searchTokens.every(
          (s: string) =>
            wkf.workflow_name.toLowerCase().includes(s) ||
            (wkf.cluster_name !== undefined
              ? wkf.cluster_name.toLowerCase().includes(s)
              : false)
        );
      })
      .filter((data) => {
        return filter.selectedCluster === 'All'
          ? true
          : data.cluster_name === filter.selectedCluster;
      })
      .filter((data) => {
        return filter.range.startDate === 'all' ||
          (filter.range.startDate && filter.range.endDate === undefined)
          ? true
          : parseInt(data.created_at, 10) * 1000 >=
              new Date(moment(filter.range.startDate).format()).getTime() &&
              parseInt(data.created_at, 10) * 1000 <=
                new Date(
                  new Date(moment(filter.range.endDate).format()).setHours(
                    23,
                    59,
                    59
                  )
                ).getTime();
      })
      .sort((a: ScheduleWorkflow, b: ScheduleWorkflow) => {
        // Sorting based on unique fields
        if (filter.sortData.name.sort) {
          const x = a.workflow_name;
          const y = b.workflow_name;

          return filter.sortData.name.ascending
            ? sortAlphaAsc(x, y)
            : sortAlphaDesc(x, y);
        }
        if (filter.sortData.startDate.sort) {
          const x = parseInt(a.created_at, 10);

          const y = parseInt(b.created_at, 10);

          return filter.sortData.startDate.ascending
            ? sortNumAsc(y, x)
            : sortNumDesc(y, x);
        }
        if (filter.sortData.cluster.sort) {
          const x = a.cluster_name;
          const y = b.cluster_name;

          return filter.sortData.cluster.ascending
            ? sortAlphaAsc(x, y)
            : sortAlphaDesc(x, y);
        }
        return 0;
      });
    setDisplayData(payload);
    setShowAll(false);
    getClusters(searchingDataRetriever());
  }, [filter, compare]);

  // data for comparison plot
  const labels = ['K8S1', 'K8S4', 'K8S2', 'K8S3'];

  const xData = {
    Daily: [
      [
        '2020-04-08',
        '2020-04-09',
        '2020-04-10',
        '2020-04-11',
        '2020-04-12',
        '2020-05-13',
        '2020-05-14',
        '2020-05-15',
        '2020-05-16',
        '2020-05-17',
      ],
      [
        '2020-04-08',
        '2020-04-09',
        '2020-04-11',
        '2020-04-12',
        '2020-06-13',
        '2020-06-16',
        '2020-07-17',
      ],
      [
        '2020-03-08',
        '2020-03-09',
        '2020-03-12',
        '2020-04-09',
        '2020-04-14',
        '2020-04-15',
        '2020-04-16',
        '2020-04-17',
      ],
      [
        '2020-04-08',
        '2020-04-09',
        '2020-07-10',
        '2020-07-11',
        '2020-09-12',
        '2020-09-13',
        '2020-11-14',
        '2020-11-16',
        '2020-11-17',
      ],
    ],
    Monthly: [
      ['2020-04-30', '2020-05-31'],
      ['2020-04-30', '2020-06-30', '2020-07-31'],
      ['2020-03-31', '2020-04-30'],
      ['2020-04-30', '2020-07-31', '2020-09-30', '2020-11-30'],
    ],
  };

  const yData = {
    Daily: [
      [0, 73, 72, 74, 70, 70, 66, 66, 69, 100],
      [56, 45, 36, 34, 35, 28, 25],
      [45, 13, 14, 24, 40, 35, 50, 55],
      [23, 18, 21, 13, 18, 17, 16, 23, 76],
    ],
    Monthly: [
      [57.8, 74.2],
      [42.75, 49, 25],
      [24, 45],
      [20.5, 17, 17.5, 38.33],
    ],
  };

  return (
    <div className={classes.root}>
      <div className={classes.analyticsDiv}>
        <Typography className={classes.heading}>
          <strong>
            {' '}
            {compare === true ? (
              <IconButton
                aria-label="back"
                aria-haspopup="true"
                onClick={() => setCompare(false)}
                className={classes.buttonBack}
              >
                <ExpandMoreTwoToneIcon
                  htmlColor={palette.secondary.dark}
                  className={classes.buttonBackStyle}
                />
              </IconButton>
            ) : (
              <div />
            )}{' '}
            Workflow comparison
          </strong>
        </Typography>
        <Typography className={classes.description}>
          {compare === true
            ? 'Choose the right workflows and get comparative results'
            : 'Choose workflows to compare their resilience scores'}
        </Typography>
        <br />
      </div>
      <div className={classes.tableFix}>
        <div>
          <section className="Heading section">
            <TableToolBar
              numSelected={selected.length}
              searchToken={filter.searchTokens[0]}
              handleSearch={(
                event: React.ChangeEvent<{ value: unknown }> | undefined,
                token: string | undefined
              ) =>
                setFilter({
                  ...filter,
                  searchTokens: (event !== undefined
                    ? ((event.target as HTMLInputElement).value as string)
                    : token || ''
                  )
                    .toLowerCase()
                    .split(' ')
                    .filter((s) => s !== ''),
                })
              }
              clusters={clusters}
              callbackToSetCluster={(clusterName: string) => {
                setFilter({
                  ...filter,
                  selectedCluster: clusterName,
                });
              }}
              callbackToSetRange={(
                selectedStartDate: string,
                selectedEndDate: string
              ) => {
                setFilter({
                  ...filter,
                  range: {
                    startDate: selectedStartDate,
                    endDate: selectedEndDate,
                  },
                });
              }}
              callbackToCompare={CallbackForComparing}
              callbackToExport={() => {}}
              comparisonState={compare}
              reInitialize={compare === false}
            />
          </section>
          <section className="table section">
            <MuiThemeProvider
              theme={
                compare === false
                  ? customThemeAnalyticsTable
                  : customThemeAnalyticsTableCompareMode
              }
            >
              <TableContainer
                className={
                  compare === false && selected.length <= 2
                    ? classes.tableMain
                    : compare === false && selected.length > 2
                    ? classes.tableMainShowAll
                    : showAll === true && selected.length <= 3
                    ? classes.tableMainShowAll
                    : showAll === true && selected.length > 3
                    ? classes.tableMain
                    : classes.tableMainCompare
                }
              >
                <Table aria-label="simple table">
                  <TableHeader
                    onSelectAllClick={handleSelectAllClick}
                    numSelected={selected.length}
                    rowCount={displayData.length}
                    comparisonState={compare}
                    callBackToSort={(sortConfigurations: SortData) => {
                      setFilter({
                        ...filter,
                        sortData: sortConfigurations,
                      });
                    }}
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Loader />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography align="center">
                            {t(
                              'chaosWorkflows.browseAnalytics.workFlowComparisonTable.unableToFetch'
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : displayData && displayData.length ? (
                      displayData
                        .slice(0)
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((data: ScheduleWorkflow, index: number) => {
                          const isItemSelected = isSelected(data.workflow_id);
                          const labelId = `enhanced-table-checkbox-${index}`;
                          return (
                            <TableRow
                              hover
                              onClick={(event) => {
                                if (compare === false) {
                                  handleClick(event, data.workflow_id);
                                }
                              }}
                              role="checkbox"
                              aria-checked={isItemSelected}
                              tabIndex={-1}
                              key={data.workflow_id}
                              selected={isItemSelected}
                            >
                              <TableData
                                data={data}
                                itemSelectionStatus={isItemSelected}
                                labelIdentifier={labelId}
                                comparisonState={compare}
                              />
                            </TableRow>
                          );
                        })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography align="center">
                            {t(
                              'chaosWorkflows.browseAnalytics.workFlowComparisonTable.noRecords'
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 75 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {compare === false || showAll === true ? (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={displayData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              ) : (
                <Paper
                  elevation={0}
                  className={classes.seeAllPaper}
                  onClick={() => setShowAll(true)}
                >
                  <Typography className={classes.seeAllText} variant="body2">
                    {' '}
                    <strong>
                      {t(
                        'chaosWorkflows.browseAnalytics.workFlowComparisonTable.showSelectedWorkflows'
                      )}{' '}
                      ({selected.length}){' '}
                    </strong>{' '}
                  </Typography>
                </Paper>
              )}
            </MuiThemeProvider>
          </section>
        </div>
      </div>
      {compare === true ? (
        <Paper variant="outlined" className={classes.backgroundFix}>
          <div className={classes.comparisonHeadingFix}>
            <Typography className={classes.heading}>
              <strong>
                {t(
                  'chaosWorkflows.browseAnalytics.workFlowComparisonTable.resilienceScoreComparison'
                )}
              </strong>
            </Typography>
            <Typography className={classes.description}>
              {t(
                'chaosWorkflows.browseAnalytics.workFlowComparisonTable.comparativeResults'
              )}
            </Typography>
            <ResilienceScoreComparisonPlot
              xData={xData}
              yData={yData}
              labels={labels}
            />
          </div>
        </Paper>
      ) : (
        <div />
      )}
    </div>
  );
};

export default WorkflowComparisonTable;
