/* eslint-disable no-loop-func */
import { useLazyQuery, useQuery } from '@apollo/client';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../components/Loader';
import {
  GET_WORKFLOW_DETAILS,
  WORKFLOW_RUN_DETAILS,
} from '../../../../graphql/queries';
import {
  Workflow,
  WorkflowDataRequest,
  WorkflowRun,
} from '../../../../models/graphql/workflowData';
import {
  ExecutionData,
  GetWorkflowsRequest,
  Pagination,
  ScheduledWorkflow,
  ScheduledWorkflows,
  WeightageMap,
} from '../../../../models/graphql/workflowListData';
import { getProjectID } from '../../../../utils/getSearchParams';
import {
  sortAlphaAsc,
  sortAlphaDesc,
  sortNumAsc,
  sortNumDesc,
} from '../../../../utils/sort';
import ResilienceScoreComparisonPlot from '../WorkflowComparisonPlot/index';
import WorkflowGraphs from '../WorkflowGraphs';
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
  workflowType: string;
  searchTokens: string[];
}

interface ResilienceScoreComparisonPlotProps {
  xData: { Hourly: string[][]; Daily: string[][]; Monthly: string[][] };
  yData: { Hourly: number[][]; Daily: number[][]; Monthly: number[][] };
  labels: string[];
  colors: string[];
}

interface DatedResilienceScore {
  date: string;
  value: number;
}

interface TestDetails {
  testNames: string[];
  testWeights: number[];
  testResults: string[];
}

interface WorkflowDataForExport {
  cluster_name: string;
  workflow_name: string;
  run_date: string;
  tests_passed: number | string;
  tests_failed: number | string;
  resilience_score: number | string;
  test_details?: TestDetails;
  test_details_string?: string;
}

const WorkflowComparisonTable = () => {
  const classes = useStyles();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<Filter>({
    range: { startDate: 'all', endDate: 'all' },
    selectedCluster: 'All',
    workflowType: 'All',
    sortData: {
      name: { sort: false, ascending: true },
      startDate: { sort: true, ascending: true },
      cluster: { sort: false, ascending: true },
    },
    searchTokens: [''],
  });
  const [displayData, setDisplayData] = useState<ScheduledWorkflow[]>([]);
  const [clusters, setClusters] = React.useState<string[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = React.useState<string[]>(
    []
  );
  const isSelected = (name: string) => selectedWorkflows.indexOf(name) !== -1;
  const [compare, setCompare] = React.useState<Boolean>(false);
  const [isDataAvailable, setIsDataAvailable] = React.useState<Boolean>(true);
  const [showAll, setShowAll] = React.useState<Boolean>(false);
  const [plotDataForComparison, setPlotDataForComparison] =
    React.useState<ResilienceScoreComparisonPlotProps>();
  const [totalValidWorkflowRuns, setTotalValidWorkflowRuns] = React.useState<
    WorkflowDataForExport[]
  >([]);
  const [totalValidWorkflowRunsCount, setTotalValidWorkflowRunsCount] =
    React.useState<number>(0);
  const projectID = getProjectID();
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 5,
  });

  const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('dddd DD/MM/YYYY HH:mm:ss Z');
    return resDate;
  };

  // Apollo query to get the scheduled workflow data
  const { data, loading, error } = useQuery<
    ScheduledWorkflows,
    GetWorkflowsRequest
  >(GET_WORKFLOW_DETAILS, {
    variables: {
      request: {
        projectID,
        workflowIDs: compare ? selectedWorkflows : [],
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
        },
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [getWorkflowRun, { loading: loadingRuns, error: errorFetchingRuns }] =
    useLazyQuery<Workflow, WorkflowDataRequest>(WORKFLOW_RUN_DETAILS, {
      variables: {
        request: {
          projectID,
          workflowIDs: selectedWorkflows,
        },
      },
      onCompleted: (data) => {
        const plotData: ResilienceScoreComparisonPlotProps = {
          xData: {
            Hourly: [[]],
            Daily: [[]],
            Monthly: [[]],
          },
          yData: {
            Hourly: [[]],
            Daily: [[]],
            Monthly: [[]],
          },
          labels: [],
          colors: [],
        };
        let totalValidRuns: number = 0;
        const totalValidWorkflowRuns: WorkflowDataForExport[] = [];
        const timeSeriesArray: DatedResilienceScore[][] = [];
        const runs = data?.listWorkflowRuns?.workflowRuns;
        selectedWorkflows.forEach((workflowID) => {
          let isWorkflowValid: boolean = false;
          const workflowTimeSeriesData: DatedResilienceScore[] = [];
          const selectedRuns =
            runs?.filter(
              (workflowRun) => workflowRun.workflowID === workflowID
            ) ?? [];
          selectedRuns.forEach((data: WorkflowRun) => {
            try {
              const executionData: ExecutionData = JSON.parse(
                data.executionData
              );
              const { nodes } = executionData;
              const experimentTestResultsArrayPerWorkflowRun: number[] = [];
              let totalExperimentsPassed: number = 0;
              let weightsSum: number = 0;
              const testDetails: TestDetails = {
                testNames: [],
                testWeights: [],
                testResults: [],
              };
              let isValid: boolean = false;
              for (const key of Object.keys(nodes)) {
                const node = nodes[key];
                if (node.chaosData) {
                  const { chaosData } = node;
                  if (
                    chaosData.experimentVerdict === 'Pass' ||
                    chaosData.experimentVerdict === 'Fail'
                  ) {
                    const weightageMap: WeightageMap[] = data.weightages;
                    weightageMap.forEach((weightage) => {
                      if (
                        chaosData.engineName.includes(weightage.experimentName)
                      ) {
                        if (chaosData.experimentVerdict === 'Pass') {
                          experimentTestResultsArrayPerWorkflowRun.push(
                            (weightage.weightage *
                              parseInt(chaosData.probeSuccessPercentage, 10)) /
                              100
                          );
                          totalExperimentsPassed += 1;
                        }
                        if (chaosData.experimentVerdict === 'Fail') {
                          experimentTestResultsArrayPerWorkflowRun.push(0);
                        }
                        weightsSum += weightage.weightage;
                        testDetails.testNames.push(weightage.experimentName);
                        testDetails.testWeights.push(weightage.weightage);
                        testDetails.testResults.push(
                          chaosData.experimentVerdict
                        );
                        isValid = true;
                        isWorkflowValid = true;
                      }
                    });
                  }
                }
              }
              if (executionData.eventType === 'UPDATE' && isValid) {
                totalValidRuns += 1;
                totalValidWorkflowRuns.push({
                  cluster_name: data.clusterName,
                  workflow_name: data.workflowName,
                  run_date: formatDate(executionData.creationTimestamp),
                  tests_passed: totalExperimentsPassed,
                  tests_failed:
                    experimentTestResultsArrayPerWorkflowRun.length -
                    totalExperimentsPassed,
                  resilience_score: data.resiliencyScore,
                  test_details: testDetails,
                });
                workflowTimeSeriesData.push({
                  date: data.lastUpdated,
                  value: experimentTestResultsArrayPerWorkflowRun.length
                    ? parseFloat(
                        (
                          (experimentTestResultsArrayPerWorkflowRun.reduce(
                            (a, b) => a + b,
                            0
                          ) /
                            weightsSum) *
                          100
                        ).toFixed(2)
                      )
                    : 0,
                });
              }
            } catch (error) {
              console.error(error);
            }
          });
          if (isWorkflowValid && selectedRuns.length) {
            plotData.labels.push(selectedRuns[0]?.workflowName ?? '');
            plotData.colors.push(`#${randomColor()}`);
            timeSeriesArray.push(workflowTimeSeriesData);
          }
        });

        if (plotData.labels.length === 0) {
          setIsDataAvailable(false);
        }

        timeSeriesArray.forEach((workflowTimeSeriesData, index) => {
          const hourlyGroupedResults = _.groupBy(
            workflowTimeSeriesData,
            (data) =>
              moment
                .unix(parseInt(data.date, 10))
                .startOf('hour')
                .format('YYYY-MM-DD HH:mm:ss')
          );
          const dailyGroupedResults = _.groupBy(
            workflowTimeSeriesData,
            (data) =>
              moment
                .unix(parseInt(data.date, 10))
                .startOf('day')
                .format('YYYY-MM-DD')
          );
          const monthlyGroupedResults = _.groupBy(
            workflowTimeSeriesData,
            (data) =>
              moment
                .unix(parseInt(data.date, 10))
                .startOf('month')
                .format('YYYY-MM')
          );
          plotData.xData.Hourly[index] = [];
          plotData.yData.Hourly[index] = [];
          Object.keys(hourlyGroupedResults).forEach((hour) => {
            let total = 0;
            hourlyGroupedResults[hour].forEach((data) => {
              total += data.value;
            });
            plotData.xData.Hourly[index].push(hour);
            plotData.yData.Hourly[index].push(
              total / hourlyGroupedResults[hour].length
            );
          });
          plotData.xData.Daily[index] = [];
          plotData.yData.Daily[index] = [];
          Object.keys(dailyGroupedResults).forEach((day) => {
            let total = 0;
            dailyGroupedResults[day].forEach((data) => {
              total += data.value;
            });
            plotData.xData.Daily[index].push(day);
            plotData.yData.Daily[index].push(
              total / dailyGroupedResults[day].length
            );
          });
          plotData.xData.Monthly[index] = [];
          plotData.yData.Monthly[index] = [];
          Object.keys(monthlyGroupedResults).forEach((month) => {
            let total = 0;
            monthlyGroupedResults[month].forEach((data) => {
              total += data.value;
            });
            plotData.xData.Monthly[index].push(month);
            plotData.yData.Monthly[index].push(
              total / monthlyGroupedResults[month].length
            );
          });
        });
        setPlotDataForComparison(plotData);
        setTotalValidWorkflowRuns(totalValidWorkflowRuns);
        setTotalValidWorkflowRunsCount(totalValidRuns);
      },
    });

  const listClusters = (searchingData: ScheduledWorkflow[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.clusterName)) {
        uniqueList.push(data.clusterName);
      }
    });
    setClusters(uniqueList);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = displayData.map(
        (n: ScheduledWorkflow) => n.workflowID
      );
      setSelectedWorkflows(newSelecteds);
      return;
    }
    setSelectedWorkflows([]);
  };

  const handleClick = (name: string) => {
    const selectedIndex = selectedWorkflows.indexOf(name);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedWorkflows, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedWorkflows.slice(1));
    } else if (selectedIndex === selectedWorkflows.length - 1) {
      newSelected = newSelected.concat(selectedWorkflows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedWorkflows.slice(0, selectedIndex),
        selectedWorkflows.slice(selectedIndex + 1)
      );
    }
    setSelectedWorkflows(newSelected);
  };

  const searchingDataRetriever = () => {
    let searchingData: ScheduledWorkflow[] = [];
    if (compare === false) {
      searchingData = data?.listWorkflows.workflows ?? [];
    } else {
      const searchedData: ScheduledWorkflow[] = [];
      selectedWorkflows.forEach((workflowID) => {
        if (data) {
          data.listWorkflows.workflows.forEach((workflow) => {
            if (workflow.workflowID === workflowID) {
              searchedData.push(workflow);
            }
          });
        }
      });
      searchingData = searchedData;
    }
    return searchingData;
  };

  const CallbackForComparing = (compareWorkflows: boolean) => {
    setIsDataAvailable(true);
    getWorkflowRun();
    setCompare(compareWorkflows);
    const payload: ScheduledWorkflow[] = [];
    selectedWorkflows.forEach((workflow) => {
      displayData.forEach((displayWorkflow, i) => {
        if (displayWorkflow.workflowID === workflow && data) {
          payload.push(data.listWorkflows.workflows[i]);
        }
      });
    });
    setDisplayData(payload);
  };

  const generatePDF = () => {
    if (document.getElementById('statistics')) {
      const heads = [
        {
          cluster_name: 'Chaos Delegate Name',
          workflow_name: 'Chaos Scenario Name',
          run_date: 'Date-Time',
          tests_passed: '#Expts. Passed',
          tests_failed: '#Expts. Failed',
          resilience_score: 'Reliability Score',
          test_details_string:
            'Chaos Experiment Details\nName\nWeight / Verdict',
        },
      ];
      const rows: any[] = [];
      totalValidWorkflowRuns.forEach((run) => {
        let detail_string = '';
        if (run.test_details) {
          run.test_details.testNames.forEach((experiment, index) => {
            detail_string += `${experiment}\n${run.test_details?.testWeights[index]} / ${run.test_details?.testResults[index]}\n`;
          });
        }
        rows.push({
          cluster_name: run.cluster_name,
          workflow_name: run.workflow_name,
          run_date: run.run_date,
          tests_passed: run.tests_passed.toString(),
          tests_failed: run.tests_failed.toString(),
          resilience_score: `${parseFloat(run.resilience_score as string)
            .toFixed(2)
            .toString()}%`,
          test_details_string: detail_string,
        });
      });

      const input: HTMLElement | null = document.getElementById('statistics');
      html2canvas(input as HTMLElement).then((canvas) => {
        const imgWidth = 206;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
        const position = -54;
        const version = process.env.REACT_APP_KB_CHAOS_VERSION;
        doc.setFillColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
        doc.text(`Chaos Center Report Version: ${version}`, 10, 10);
        doc.text('Time of Generation:', 10, 15);
        doc.text(new Date().toString(), 42, 15);
        doc.text(
          'Total Number of Chaos Scenario Schedules under consideration:',
          10,
          20
        );
        doc.text(
          plotDataForComparison
            ? plotDataForComparison.labels.length.toString()
            : '0',
          114,
          20
        );
        doc.text(
          'Total Number of Chaos Scenario Runs under consideration:',
          10,
          25
        );
        doc.text(totalValidWorkflowRunsCount.toString(), 105, 25);
        const img = new Image();
        img.src = './icons/LitmusLogo.png';
        doc.addImage(img, 'png', 165, 10, 30, 12.5);
        doc.line(0, 33, 300, 33);
        doc.setLineWidth(5.0);
        doc.text(
          'Chaos  Run Details Table & Chaos Scenario Schedules Table with Resilience Score Comparison Graph',
          27.5,
          39
        );
        try {
          autoTable(doc, {
            head: heads,
            body: rows,
            startY: 44,
            margin: {
              horizontal: 2,
            },
            styles: {
              overflow: 'linebreak',
              font: 'Inter',
              lineColor: [0, 0, 0],
            },
            bodyStyles: {
              valign: 'top',
              fillColor: [245, 246, 255],
              textColor: [0, 0, 0],
              lineWidth: 0.05,
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.05,
            headStyles: {
              fillColor: [245, 246, 255],
              textColor: [0, 0, 0],
              lineWidth: 0.05,
              lineColor: [0, 0, 0],
            },
            alternateRowStyles: {
              fillColor: [245, 246, 255],
            },
            theme: 'striped',
            showHead: 'firstPage',
          });
        } catch (err) {
          console.error(err);
        }
        doc.addPage();
        doc.addImage(
          contentDataURL,
          'PNG',
          2,
          showAll ? position : 4,
          imgWidth,
          imgHeight
        );
        doc.save('chaos-center-statistics.pdf'); // Generated PDF
      });
    }
  };

  useEffect(() => {
    setDisplayData(data ? data.listWorkflows.workflows : []);
    listClusters(data ? data.listWorkflows.workflows : []);
  }, [data]);

  useEffect(() => {
    const payload = searchingDataRetriever()
      .filter((wkf) => {
        return filter.searchTokens.every(
          (s: string) =>
            wkf.workflowName.toLowerCase().includes(s) ||
            (wkf.clusterName !== undefined
              ? wkf.clusterName.toLowerCase().includes(s)
              : false)
        );
      })
      .filter((data) => {
        return filter.selectedCluster === 'All'
          ? true
          : data.clusterName === filter.selectedCluster;
      })
      .filter((data) => {
        return filter.range.startDate === 'all' ||
          (filter.range.startDate && filter.range.endDate === undefined)
          ? true
          : parseInt(data.createdAt, 10) * 1000 >=
              new Date(moment(filter.range.startDate).format()).getTime() &&
              parseInt(data.createdAt, 10) * 1000 <=
                new Date(
                  new Date(moment(filter.range.endDate).format()).setHours(
                    23,
                    59,
                    59
                  )
                ).getTime();
      })
      .filter((dataRow) =>
        filter.workflowType === 'All'
          ? true
          : filter.workflowType === 'workflow'
          ? dataRow.cronSyntax.length === 0 || dataRow.cronSyntax === ''
          : filter.workflowType === 'cronworkflow'
          ? dataRow.cronSyntax.length > 0
          : false
      )
      .sort((a, b) => {
        // Sorting based on unique fields
        if (filter.sortData.name.sort) {
          const x = a.workflowName;
          const y = b.workflowName;

          return filter.sortData.name.ascending
            ? sortAlphaAsc(x, y)
            : sortAlphaDesc(x, y);
        }
        if (filter.sortData.startDate.sort) {
          const x = parseInt(a.createdAt, 10);

          const y = parseInt(b.createdAt, 10);

          return filter.sortData.startDate.ascending
            ? sortNumAsc(y, x)
            : sortNumDesc(y, x);
        }
        if (filter.sortData.cluster.sort) {
          const x = a.clusterName;
          const y = b.clusterName;

          return filter.sortData.cluster.ascending
            ? sortAlphaAsc(x, y)
            : sortAlphaDesc(x, y);
        }
        return 0;
      });
    setDisplayData(payload);
    setShowAll(false);
    listClusters(searchingDataRetriever());
  }, [filter, compare]);

  return (
    <div className={classes.root}>
      {compare !== true && <WorkflowGraphs />}
      <div className={classes.statisticsDiv}>
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
                  htmlColor={palette.primary.main}
                  className={classes.buttonBackStyle}
                />
              </IconButton>
            ) : (
              <div />
            )}{' '}
            Chaos Scenario comparison
          </strong>
        </Typography>
        <Typography className={classes.description}>
          {compare === true
            ? 'Choose the right Chaos Scenarios and get comparative results'
            : 'Choose Chaos Scenarios to compare their resilience scores'}
        </Typography>
        <br />
      </div>
      <div className={classes.tableFix}>
        <div>
          <section className="Heading section">
            <TableToolBar
              numSelected={selectedWorkflows.length}
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
              workflowType={filter.workflowType}
              workflowTypeFilterHandler={(value: string) => {
                setFilter({
                  ...filter,
                  workflowType: value,
                });
              }}
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
              callbackToExport={() => generatePDF()}
              comparisonState={compare}
              reInitialize={compare === false}
            />
          </section>
          <section className="table section">
            <Paper>
              <TableContainer
                className={
                  !compare || showAll
                    ? classes.tableMain
                    : classes.tableMainCompare
                }
              >
                <Table stickyHeader aria-label="simple table">
                  <TableHeader
                    onSelectAllClick={handleSelectAllClick}
                    numSelected={selectedWorkflows.length}
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
                    {loading || !data?.listWorkflows ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Loader />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography align="center" className={classes.error}>
                            {t(
                              'chaosWorkflows.browseStatistics.workFlowComparisonTable.unableToFetch'
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : displayData.length ? (
                      displayData.map((data, index) => {
                        const isItemSelected = isSelected(data.workflowID);
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow
                            hover
                            onClick={() => {
                              if (compare === false) {
                                handleClick(data.workflowID);
                              }
                            }}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={data.workflowID}
                            selected={isItemSelected}
                            classes={{ selected: classes.tableRowSelected }}
                            data-cy={data.workflowName}
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
                        <TableCell colSpan={6} className={classes.error}>
                          <Typography align="center">
                            {t(
                              'chaosWorkflows.browseStatistics.workFlowComparisonTable.noRecords'
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* </MuiThemeProvider> */}
              {!compare || showAll ? (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={data?.listWorkflows.totalNoOfWorkflows ?? 0}
                  rowsPerPage={paginationData.limit}
                  page={paginationData.page}
                  onChangePage={(_, page) =>
                    setPaginationData({ ...paginationData, page })
                  }
                  onChangeRowsPerPage={(event) => {
                    setPaginationData({
                      ...paginationData,
                      page: 0,
                      limit: parseInt(event.target.value, 10),
                    });
                  }}
                  className={classes.tablePagination}
                  SelectProps={{
                    MenuProps: {
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'right',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                      getContentAnchorEl: null,
                      classes: { paper: classes.menuList },
                    },
                  }}
                  classes={{ menuItem: classes.menuListItem }}
                />
              ) : (
                <Paper
                  elevation={0}
                  className={classes.seeAllPaper}
                  onClick={() => setShowAll(true)}
                >
                  <Typography className={classes.seeAllText} variant="body2">
                    <strong>
                      {` ${t(
                        'chaosWorkflows.browseStatistics.workFlowComparisonTable.showSelectedWorkflows'
                      )} ${selectedWorkflows.length}`}
                    </strong>
                  </Typography>
                </Paper>
              )}
            </Paper>
          </section>
        </div>
      </div>
      <div id="statistics">
        {compare === true && isDataAvailable === true ? (
          <Paper variant="outlined" className={classes.backgroundFix}>
            <div className={classes.comparisonHeadingFix}>
              <Typography className={classes.heading}>
                <strong>
                  {t(
                    'chaosWorkflows.browseStatistics.workFlowComparisonTable.resilienceScoreComparison'
                  )}
                </strong>
              </Typography>
              <Typography className={classes.description}>
                {t(
                  'chaosWorkflows.browseStatistics.workFlowComparisonTable.comparativeResults'
                )}
              </Typography>
            </div>
            {plotDataForComparison && !loadingRuns && !errorFetchingRuns ? (
              <ResilienceScoreComparisonPlot
                xData={plotDataForComparison.xData}
                yData={plotDataForComparison.yData}
                labels={plotDataForComparison.labels}
                colors={plotDataForComparison.colors}
              />
            ) : loadingRuns ? (
              <Paper variant="outlined" className={classes.noData}>
                <Loader />
                <Typography
                  variant="h5"
                  align="center"
                  className={classes.error}
                >
                  {t(
                    'chaosWorkflows.browseStatistics.workFlowComparisonTable.loadingRuns'
                  )}
                </Typography>
              </Paper>
            ) : (
              <Paper variant="outlined" className={classes.noData}>
                <Typography
                  variant="h5"
                  align="center"
                  className={classes.error}
                >
                  {t(
                    'chaosWorkflows.browseStatistics.workFlowComparisonTable.errorFetchingRuns'
                  )}
                </Typography>
              </Paper>
            )}
          </Paper>
        ) : (
          compare === true && (
            <Paper variant="outlined" className={classes.noData}>
              <Typography variant="h5" align="center" className={classes.error}>
                {t(
                  'chaosWorkflows.browseStatistics.workFlowComparisonTable.noRuns'
                )}
              </Typography>
            </Paper>
          )
        )}
      </div>
    </div>
  );
};

export default WorkflowComparisonTable;
