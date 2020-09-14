/* eslint-disable no-unused-expressions */
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Divider,
  TablePagination,
  MuiThemeProvider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Paper,
} from '@material-ui/core';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import useStyles, { customTheme, customThemeCompare } from './styles';
import TableData from './TableData';
import TableHeader from './TableHeader';
import TableToolBar from './TableToolbar';

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
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Apollo query to get the scheduled data
  const { data } = useQuery<Schedules, ScheduleDataVars>(SCHEDULE_DETAILS, {
    variables: { projectID: selectedProjectID },
  });

  const [filter, setFilter] = React.useState<Filter>({
    range: { startDate: 'all', endDate: 'all' },
    selectedCluster: 'All',
    sortData: {
      name: { sort: false, ascending: true },
      startDate: { sort: true, ascending: false },
      cluster: { sort: false, ascending: true },
    },
    searchTokens: [''],
  });

  const [displayData, setDisplayData] = useState<ScheduleWorkflow[]>([]);

  const [clusters, setClusters] = React.useState<string[]>([]);

  const getClusters = (searchingData: ScheduleWorkflow[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.cluster_name)) {
        uniqueList.push(data.cluster_name);
      }
    });
    setClusters(uniqueList);
  };

  useEffect(() => {
    setDisplayData(data ? data?.getScheduledWorkflows : []);
    getClusters(data ? data?.getScheduledWorkflows : []);
  }, [data]);

  const classes = useStyles();

  const [page, setPage] = React.useState(0);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [selected, setSelected] = React.useState<string[]>([]);

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, displayData.length - page * rowsPerPage);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = displayData.map((n: any) => n.workflow_id);
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

  const [compare, setCompare] = React.useState<Boolean>(false);

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

  const [showAll, setShowAll] = React.useState<Boolean>(true);

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

  // const CallbackForExporting = (exportAnalytics: boolean) => {};

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
  }, [filter]);

  return (
    <div>
      <Divider variant="middle" className={classes.horizontalLine} />
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
                    htmlColor="#5B44BA"
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
                callbackToExport={() => {}} // CallbackForExporting}
                comparisonState={compare}
                reInitialize={compare === false}
              />
            </section>
            <section className="table section">
              <MuiThemeProvider
                theme={compare === false ? customTheme : customThemeCompare}
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
                      {displayData &&
                        displayData
                          .slice(0)
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((data: any, index: any) => {
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
                          })}
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
                        Show all selected workflows ({selected.length}){' '}
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
                <strong>Resilience score comparison</strong>
              </Typography>
              <Typography className={classes.description}>
                Comparative results of selected workflow
              </Typography>
            </div>
          </Paper>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default WorkflowComparisonTable;
