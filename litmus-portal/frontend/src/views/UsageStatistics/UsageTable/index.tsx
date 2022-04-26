import { useLazyQuery } from '@apollo/client';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Search, Typography } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import config from '../../../config';
import { GLOBAL_PROJECT_DATA } from '../../../graphql';
import { UsageStats } from '../../../models/graphql/usage';
import { ProjectStats } from '../../../models/graphql/user';
import { getToken } from '../../../utils/auth';
import { sortNumAsc, sortNumDesc } from '../../../utils/sort';
import useStyles from './styles';

interface SortInput {
  Field:
    | 'Project'
    | 'Owner'
    | 'Agents'
    | 'Schedules'
    | 'WorkflowRuns'
    | 'ExperimentRuns'
    | 'TeamMembers';
  Descending?: boolean;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}
interface TableData {
  ProjectName: string;
  Owner: string;
  Agents: number;
  Schedules: number;
  WfRuns: number;
  ExpRuns: number;
  Members: number;
}

interface TimeRange {
  start_time: string;
  end_time: string;
}

interface SortData {
  Agent: { sort: boolean; ascending: boolean };
  Schedules: { sort: boolean; ascending: boolean };
  Members: { sort: boolean; ascending: boolean };
}

const UsageTable: React.FC<TimeRange> = ({ start_time, end_time }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  let usageData: TableData;

  const [sortData, setSortData] = useState<SortData>({
    Agent: { sort: false, ascending: true },
    Schedules: { sort: false, ascending: true },
    Members: { sort: false, ascending: true },
  });
  const [search, setSearch] = useState<string>('');

  const [usageQuery, { loading, data }] =
    useLazyQuery<UsageStats>(GLOBAL_PROJECT_DATA);

  const [projectStats, setProjectStats] = React.useState<ProjectStats[]>([]);

  const tableData: TableData[] = [];

  useEffect(() => {
    usageQuery({
      variables: {
        query: {
          DateRange: {
            start_date: start_time,
            end_date: end_time,
          },
        },
      },
    });
  }, [start_time, end_time]);

  const getProjectStats = () => {
    fetch(`${config.auth.url}/get_projects_stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else if (data.data) {
          setProjectStats(data.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  projectStats.map((project) => {
    usageData = {
      ProjectName: project.name,
      Owner: project.members.owner[0].username,
      Agents: 0,
      Schedules: 0,
      WfRuns: 0,
      ExpRuns: 0,
      Members: project.members.total,
    };
    for (let i = 0; i < (data ? data.usageQuery.projects.length : 0); i++) {
      if (project.projectID === data?.usageQuery.projects[i].projectID) {
        usageData.Agents = data.usageQuery.projects[i].agents.total;
        usageData.ExpRuns = data.usageQuery.projects[i].workflows.expRuns;
        usageData.WfRuns = data.usageQuery.projects[i].workflows.runs;
        usageData.Schedules = data.usageQuery.projects[i].workflows.schedules;
        break;
      }
    }
    tableData.push(usageData);
    return null;
  });

  React.useEffect(() => {
    getProjectStats();
  }, []);

  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });
  const filteredData: TableData[] = tableData
    .filter((dataRow) =>
      dataRow.ProjectName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: TableData, b: TableData) => {
      if (sortData.Agent.sort) {
        const x = a.Agents;
        const y = b.Agents;

        return sortData.Agent.ascending ? sortNumAsc(y, x) : sortNumDesc(y, x);
      }
      if (sortData.Schedules.sort) {
        const x = a.Schedules;
        const y = b.Schedules;

        return sortData.Schedules.ascending
          ? sortNumAsc(y, x)
          : sortNumDesc(y, x);
      }
      if (sortData.Members.sort) {
        const x = a.Members;
        const y = b.Members;

        return sortData.Members.ascending
          ? sortNumAsc(y, x)
          : sortNumDesc(y, x);
      }
      return 0;
    });

  return (
    <div className={classes.table}>
      <div className={classes.headerSection}>
        {/* Search Bar */}
        <Search
          className={classes.search}
          data-cy="projectSearch"
          id="input-with-icon-textfield"
          placeholder="Search Projects"
          value={search}
          onChange={(event: any) => {
            setSearch(event.target.value);
            setPaginationData({ ...paginationData, pageNo: 0 });
          }}
        />
      </div>

      <Paper>
        <TableContainer className={classes.tableMain}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                {/* Projects */}
                <TableCell className={classes.projectName}>
                  <Typography className={classes.tableHeadName}>
                    {t('usage.table.project')}
                  </Typography>
                </TableCell>

                {/* Owners */}
                <TableCell align="left">
                  <Typography className={classes.tableHeadName}>
                    {t('usage.table.owner')}
                  </Typography>
                </TableCell>

                {/* Agents */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.agents')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort agent ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            Agent: { sort: true, ascending: true },
                            Schedules: { sort: false, ascending: true },
                            Members: { sort: false, ascending: true },
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort agents descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            Agent: { sort: true, ascending: false },
                            Schedules: { sort: false, ascending: true },
                            Members: { sort: false, ascending: true },
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Schedules */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.schedules')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort schedules ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            Schedules: { sort: true, ascending: true },
                            Agent: { sort: false, ascending: true },
                            Members: { sort: false, ascending: true },
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort schedules descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            Schedules: { sort: true, ascending: false },
                            Agent: { sort: false, ascending: true },
                            Members: { sort: false, ascending: true },
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* WorkflowRuns */}
                <TableCell align="center">
                  <Typography className={classes.tableHeadName}>
                    {t('usage.table.wfRuns')}
                  </Typography>
                </TableCell>

                {/* ExperimentRuns */}
                <TableCell align="center">
                  <Typography className={classes.tableHeadName}>
                    {t('usage.table.expRuns')}
                  </Typography>
                </TableCell>

                {/* Team Mambers */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.team')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort TeamMembers ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            Schedules: { sort: false, ascending: false },
                            Agent: { sort: false, ascending: true },
                            Members: { sort: true, ascending: true },
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort TeamMembers descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Schedules: { sort: false, ascending: false },
                            Agent: { sort: false, ascending: true },
                            Members: { sort: true, ascending: false },
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData
                  .slice(
                    paginationData.pageNo * paginationData.rowsPerPage,
                    paginationData.pageNo * paginationData.rowsPerPage +
                      paginationData.rowsPerPage
                  )
                  .map((project: TableData) => (
                    <TableRow
                      key={project.ProjectName}
                      className={classes.projectData}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        className={classes.tableDataProjectName}
                      >
                        {project.ProjectName}
                      </TableCell>
                      <TableCell align="left">{project.Owner}</TableCell>
                      <TableCell align="center">{project.Agents}</TableCell>
                      <TableCell align="center">{project.Schedules}</TableCell>
                      <TableCell align="center">{project.WfRuns}</TableCell>
                      <TableCell align="center">{project.ExpRuns}</TableCell>
                      <TableCell align="center">{project.Members}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography className={classes.center}>
                      <strong>{t('usage.table.noProject')}</strong>
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length ?? 0}
          rowsPerPage={paginationData.rowsPerPage}
          page={paginationData.pageNo}
          onChangePage={(_, page) =>
            setPaginationData({
              ...paginationData,
              pageNo: page,
            })
          }
          onChangeRowsPerPage={(event) =>
            setPaginationData({
              ...paginationData,
              pageNo: 0,
              rowsPerPage: parseInt(event.target.value, 10),
            })
          }
        />
      </Paper>
    </div>
  );
};

export default UsageTable;
