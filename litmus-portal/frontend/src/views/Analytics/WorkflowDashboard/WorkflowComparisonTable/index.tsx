/* eslint-disable no-unused-expressions */
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
  WORKFLOW_LIST_DETAILS,
  WORKFLOW_RUN_DETAILS,
} from '../../../../graphql/queries';
import {
  Workflow,
  WorkflowDataVars,
  WorkflowRun,
} from '../../../../models/graphql/workflowData';
import {
  ExecutionData,
  ListWorkflowsInput,
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
    sortData: {
      name: { sort: false, ascending: true },
      startDate: { sort: true, ascending: true },
      cluster: { sort: false, ascending: true },
    },
    searchTokens: [''],
  });
  const [displayData, setDisplayData] = useState<ScheduledWorkflow[]>([]);
  const [clusters, setClusters] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const isSelected = (name: string) => selected.indexOf(name) !== -1;
  const [compare, setCompare] = React.useState<Boolean>(false);
  const [isDataAvailable, setIsDataAvailable] = React.useState<Boolean>(true);
  const [showAll, setShowAll] = React.useState<Boolean>(true);
  const [plotDataForComparison, setPlotDataForComparison] =
    React.useState<ResilienceScoreComparisonPlotProps>();
  const [totalValidWorkflowRuns, setTotalValidWorkflowRuns] = React.useState<
    WorkflowDataForExport[]
  >([]);
  const [totalValidWorkflowRunsCount, setTotalValidWorkflowRunsCount] =
    React.useState<number>(0);

  const [selectedWorkflowID, setSelectedWorkflowID] = useState('');

  const projectID = getProjectID();

  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 5,
  });

  // Apollo query to get the scheduled workflow data
  const { data, loading, error } = useQuery<
    ScheduledWorkflows,
    ListWorkflowsInput
  >(WORKFLOW_LIST_DETAILS, {
    variables: {
      workflowInput: {
        project_id: projectID,
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
        },
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [getWorkflowRun, { data: workflowRunsData }] = useLazyQuery<
    Workflow,
    WorkflowDataVars
  >(WORKFLOW_RUN_DETAILS, {
    variables: {
      workflowRunsInput: {
        project_id: projectID,
        workflow_ids: [selectedWorkflowID],
      },
    },
  });

  const getClusters = (searchingData: ScheduledWorkflow[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.cluster_name)) {
        uniqueList.push(data.cluster_name);
      }
    });
    setClusters(uniqueList);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = displayData.map(
        (n: ScheduledWorkflow) => n.workflow_id
      );
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (name: string) => {
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
    let searchingData: ScheduledWorkflow[] = [];
    if (compare === false) {
      searchingData = data?.ListWorkflow.workflows ?? [];
    } else {
      const searchedData: ScheduledWorkflow[] = [];
      selected.forEach((workflowID) => {
        data?.ListWorkflow.workflows.forEach((workflow) => {
          if (workflow.workflow_id === workflowID) {
            searchedData.push(workflow);
          }
        });
      });
      searchingData = searchedData;
    }
    return searchingData;
  };

  const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('dddd DD/MM/YYYY HH:mm:ss Z');
    return resDate;
  };

  const generateDataForComparing = () => {
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
    selected.forEach((workflow) => {
      // const workflowData = data?.ListWorkflow.workflows.filter(function match(
      //   wkf
      // ) {
      //   return wkf.workflow_id === workflow;
      // });
      setSelectedWorkflowID(workflow);
      getWorkflowRun();
      const runs = workflowRunsData?.getWorkflowRuns.workflow_runs;
      const workflowTimeSeriesData: DatedResilienceScore[] = [];
      let isWorkflowValid: boolean = false;
      runs?.forEach((data: WorkflowRun) => {
        try {
          const executionData: ExecutionData = JSON.parse(data.execution_data);
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
                  if (weightage.experiment_name === chaosData.experimentName) {
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
                    if (
                      chaosData.experimentVerdict === 'Pass' ||
                      chaosData.experimentVerdict === 'Fail'
                    ) {
                      weightsSum += weightage.weightage;
                      testDetails.testNames.push(weightage.experiment_name);
                      testDetails.testWeights.push(weightage.weightage);
                      testDetails.testResults.push(chaosData.experimentVerdict);
                      isValid = true;
                      isWorkflowValid = true;
                    }
                  }
                });
              }
            }
          }
          if (executionData.event_type === 'UPDATE' && isValid) {
            totalValidRuns += 1;
            totalValidWorkflowRuns.push({
              cluster_name: data.cluster_name,
              workflow_name: data.workflow_name,
              run_date: formatDate(executionData.creationTimestamp),
              tests_passed: totalExperimentsPassed,
              tests_failed:
                experimentTestResultsArrayPerWorkflowRun.length -
                totalExperimentsPassed,
              resilience_score: data.resiliency_score,
              test_details: testDetails,
            });
            workflowTimeSeriesData.push({
              date: data.last_updated,
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
      if (isWorkflowValid) {
        plotData.labels.push(
          workflowRunsData?.getWorkflowRuns.workflow_runs[0].workflow_name ?? ''
        );
        plotData.colors.push(`#${randomColor()}`);
        timeSeriesArray.push(workflowTimeSeriesData);
      }
    });

    if (plotData.labels.length === 0) {
      setIsDataAvailable(false);
    }

    timeSeriesArray.forEach((workflowTimeSeriesData, index) => {
      const hourlyGroupedResults = _.groupBy(workflowTimeSeriesData, (data) =>
        moment
          .unix(parseInt(data.date, 10))
          .startOf('hour')
          .format('YYYY-MM-DD HH:mm:ss')
      );
      const dailyGroupedResults = _.groupBy(workflowTimeSeriesData, (data) =>
        moment.unix(parseInt(data.date, 10)).startOf('day').format('YYYY-MM-DD')
      );
      const monthlyGroupedResults = _.groupBy(workflowTimeSeriesData, (data) =>
        moment.unix(parseInt(data.date, 10)).startOf('month').format('YYYY-MM')
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
  };

  const CallbackForComparing = (compareWorkflows: boolean) => {
    setCompare(compareWorkflows);
    const payload: ScheduledWorkflow[] = [];
    selected.forEach((workflow) => {
      displayData.forEach((displayWorkflow, i) => {
        if (displayWorkflow.workflow_id === workflow && data) {
          payload.push(data?.ListWorkflow.workflows[i]);
        }
      });
    });
    generateDataForComparing();
    setDisplayData(payload);
  };

  const generatePDF = () => {
    if (document.getElementById('analytics')) {
      const heads = [
        {
          cluster_name: 'Cluster Name',
          workflow_name: 'Workflow Name',
          run_date: 'Date-Time',
          tests_passed: '#Expts. Passed',
          tests_failed: '#Expts. Failed',
          resilience_score: 'Reliability Score',
          test_details_string: 'Experiment Details\nName\nWeight / Verdict',
        },
      ];
      const rows: any[] = [];
      totalValidWorkflowRuns.forEach((run) => {
        let detail_string = '';
        run.test_details?.testNames.forEach((experiment, index) => {
          detail_string += `${experiment}\n${run.test_details?.testWeights[index]} / ${run.test_details?.testResults[index]}\n`;
        });
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

      const input: HTMLElement | null = document.getElementById('analytics');
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
        doc.text(`Litmus Portal Report Version: ${version}`, 10, 10);
        doc.text('Time of Generation:', 10, 15);
        doc.text(new Date().toString(), 42, 15);
        doc.text(
          'Total Number of Chaos Workflow Schedules under consideration:',
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
          'Total Number of Chaos Workflow Runs under consideration:',
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
          'Workflow Run Details Table & Workflow Schedules Table with Resilience Score Comparison Graph',
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
              font: 'Ubuntu',
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
          showAll ? position : -55,
          imgWidth,
          imgHeight
        );
        doc.save('litmus-portal-analytics.pdf'); // Generated PDF
      });
    }
  };

  useEffect(() => {
    setDisplayData(data ? data.ListWorkflow.workflows : []);
    getClusters(data ? data.ListWorkflow.workflows : []);
  }, [data]);

  useEffect(() => {
    const payload = searchingDataRetriever()
      .filter((wkf) => {
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
      .sort((a, b) => {
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

  return (
    <div className={classes.root} id="analytics">
      {compare !== true && <WorkflowGraphs />}
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
                  htmlColor={palette.primary.main}
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
              callbackToExport={() => generatePDF()}
              comparisonState={compare}
              reInitialize={compare === false}
            />
          </section>
          <section className="table section">
            <Paper className={classes.tableBody}>
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
                <Table stickyHeader aria-label="simple table">
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
                    {loading && !data?.ListWorkflow ? (
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
                              'chaosWorkflows.browseAnalytics.workFlowComparisonTable.unableToFetch'
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : displayData.length ? (
                      displayData.map((data, index) => {
                        const isItemSelected = isSelected(data.workflow_id);
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow
                            hover
                            onClick={() => {
                              if (compare === false) {
                                handleClick(data.workflow_id);
                              }
                            }}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={data.workflow_id}
                            selected={isItemSelected}
                            classes={{ selected: classes.tableRowSelected }}
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
                              'chaosWorkflows.browseAnalytics.workFlowComparisonTable.noRecords'
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
                  count={data?.ListWorkflow.total_no_of_workflows ?? 0}
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
                  className={classes.pagination}
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
            </Paper>
          </section>
        </div>
      </div>
      {isDataAvailable === true ? (
        <div>
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
                {plotDataForComparison ? (
                  <ResilienceScoreComparisonPlot
                    xData={plotDataForComparison.xData}
                    yData={plotDataForComparison.yData}
                    labels={plotDataForComparison.labels}
                    colors={plotDataForComparison.colors}
                  />
                ) : (
                  <div />
                )}
              </div>
            </Paper>
          ) : (
            <div />
          )}
        </div>
      ) : (
        <Paper variant="outlined" className={classes.noData}>
          <Typography variant="h5" align="center" className={classes.error}>
            {t('chaosWorkflows.browseAnalytics.workFlowComparisonTable.noRuns')}
          </Typography>{' '}
        </Paper>
      )}
    </div>
  );
};

export default WorkflowComparisonTable;
