import { useQuery } from '@apollo/client/react/hooks';
import {
  createStyles,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Theme,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GET_USER } from '../../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
} from '../../../models/graphql/user';
import { RootState } from '../../../redux/reducers';
import Invitation from './Invitation';
import InviteNew from './InviteNew';
import useStyles from './styles';
import TableData from './tableData';

// StyledTableCell used to create custom table cell
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.homePageCardBackgroundColor,
      color: theme.palette.teamingTabHeadTextColor,
    },
    body: {
      backgroundColor: theme.palette.homePageCardBackgroundColor,
      fontSize: '0.875rem',
    },
  })
)(TableCell);

interface FilterOptions {
  search: string;
  role: string;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}
// TeammingTab displays team member table
const TeammingTab: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const userData = useSelector((state: RootState) => state.userData);

  // for response data
  const [rows, setRows] = useState<Member[]>([]);

  // query for getting all the data for the logged in user
  const { data } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    {
      variables: { username: userData.username },
      fetchPolicy: 'cache-and-network',
    }
  );

  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    role: 'all',
  });

  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // logic for displaying the team members of the user
  let memberList: Member[] = [];
  const users: Member[] = [];
  useEffect(() => {
    if (data?.getUser.username === userData.username) {
      const projectList = data?.getUser.projects;

      projectList.forEach((project) => {
        if (project.id === userData.selectedProjectID) {
          memberList = project.members;
        }
      });

      memberList.forEach((member) => {
        if (
          member.invitation === 'Accepted' &&
          member.user_name !== userData.username
        ) {
          users.push(member);
        }

        setRows(users);
      });
    }
  }, [data, userData.selectedProjectID]);

  // for data filtering based on user role
  const filteredData =
    rows &&
    rows
      .filter((dataRow) =>
        dataRow?.name.toLowerCase().includes(filters.search.toLowerCase())
      )
      .filter((dataRow) => {
        if (filters.role === 'all') return true;
        if (filters.role === 'Editor') return dataRow.role === 'Editor';
        if (filters.role === 'Viewer') return dataRow.role === 'Viewer';
        return dataRow.role === 'Owner';
      });

  return (
    <div>
      <div className={classes.UMDiv}>
        <div className={classes.members}>
          <img src="./icons/user.svg" alt="members" />
          <Typography className={classes.memTypo}>
            {t('settings.teamingTab.header')} (
            <span>{rows ? rows.length : 0}</span>)
          </Typography>
        </div>
        <Typography className={classes.descText}>
          {t('settings.teamingTab.description')}:
        </Typography>
        <div>
          <Toolbar data-cy="toolBarComponent" className={classes.toolbar}>
            {/* Search user */}
            <div className={classes.toolbarFirstCol}>
              <TextField
                data-cy="teamingSearch"
                id="input-with-icon-textfield"
                placeholder={t('settings.teamingTab.label.search')}
                value={filters.search}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    search: e.target.value,
                  });
                  setPaginationData({ ...paginationData, pageNo: 0 });
                }}
                InputProps={{
                  style: {
                    maxWidth: '15.75rem',
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {/* filter menu */}
              <div className={classes.filter}>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  color="secondary"
                  focused
                >
                  <InputLabel className={classes.selectText}>Role</InputLabel>
                  <Select
                    label={t('settings.teamingTab.label.role')}
                    value={filters.role}
                    onChange={(event) => {
                      setFilters({
                        ...filters,
                        role: event.target.value as string,
                      });
                      setPaginationData({ ...paginationData, pageNo: 0 });
                    }}
                    className={classes.selectText}
                    color="secondary"
                  >
                    <MenuItem value="all">
                      {t('settings.teamingTab.label.options.all')}
                    </MenuItem>
                    <MenuItem value="Editor">
                      {t('settings.teamingTab.label.options.editor')}
                    </MenuItem>
                    <MenuItem value="Viewer">
                      {t('settings.teamingTab.label.options.viewer')}
                    </MenuItem>
                    <MenuItem value="Owner">
                      {t('settings.teamingTab.label.options.owner')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className={classes.buttonDiv}>
              <Invitation />
              <InviteNew />
            </div>
          </Toolbar>
          {/* user table */}
          <Paper className={classes.root}>
            <TableContainer
              className={classes.table}
              elevation={0}
              component={Paper}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow className={classes.TR}>
                    <StyledTableCell className={classes.styledTC}>
                      {t('settings.teamingTab.tableCell.name')}
                    </StyledTableCell>
                    <StyledTableCell>
                      {t('settings.teamingTab.tableCell.role')}
                    </StyledTableCell>
                    <StyledTableCell>
                      {t('settings.teamingTab.tableCell.email')}
                    </StyledTableCell>
                    <StyledTableCell>
                      {t('settings.teamingTab.tableCell.joined')}
                    </StyledTableCell>
                    <StyledTableCell />
                    <TableHead />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData && filteredData.length > 0 ? (
                    filteredData
                      .slice(
                        paginationData.pageNo * paginationData.rowsPerPage,
                        paginationData.pageNo * paginationData.rowsPerPage +
                          paginationData.rowsPerPage
                      )
                      .map((row, index) => (
                        <TableRow
                          data-cy="teamingTableRow"
                          key={row.name}
                          className={classes.TR}
                        >
                          <TableData index={index} row={row} />
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography align="center">
                          {t('settings.teamingTab.noUsers')}
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
              count={filteredData?.length ?? 0}
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
      </div>
    </div>
  );
};
export default TeammingTab;
