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
import { ButtonFilled } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { UserData } from '../../../../models/graphql/user';
import { getToken } from '../../../../utils/auth';
import CreateUser from '../CreateUser';
import EditUser from '../EditUser';
import useStyles from './styles';
import TableData from './tableData';

// StyledTableCell used to create custom table cell
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.cards.background,
      color: theme.palette.text.primary,
    },
    body: {
      fontSize: '0.875rem',
    },
  })
)(TableCell);

interface FilterOptions {
  search: string;
  status: string;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}
// UserManagement displays users table
const UserManagement: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [showDiv, setShowDiv] = React.useState<boolean>(false);
  // for response data
  const [rows, setRows] = useState<UserData[]>([]);
  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
  });
  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });
  const [editDiv, setEditDiv] = React.useState<boolean>(false);

  useEffect(() => {
    fetch(`${config.auth.url}/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        setRows(res);
      })

      .catch((err) => {
        console.error(err);
      });
  }, [showDiv]);

  const filteredData = rows
    ?.filter((dataRow) =>
      dataRow.username.toLowerCase().includes(filters.search.toLowerCase())
    )
    .filter((datarow) => {
      if (filters.status === 'all') return true;
      if (filters.status === 'deactivated') return datarow.deactivated_at;
      return !datarow.deactivated_at;
    });

  const [currRow, setCurrRow] = React.useState<UserData>();

  return (
    <div>
      {showDiv ? (
        <div>
          {/* for create new user div */}
          <CreateUser handleDiv={() => setShowDiv(false)} />
        </div>
      ) : (
        <div>
          {editDiv ? (
            <div>
              <EditUser
                handleDiv={() => setEditDiv(false)}
                email={currRow?.email ?? ''}
                fullName={currRow?.name ?? ''}
                userName={currRow?.username ?? ''}
              />
            </div>
          ) : (
            // for displaying user table
            <div>
              <div className={classes.UMDiv}>
                <div className={classes.members}>
                  <img src="./icons/user.svg" alt="members" />
                  <Typography className={classes.memTypo}>
                    {t('settings.userManagementTab.header')} (
                    <span>{rows ? rows.length : 0}</span>)
                  </Typography>
                </div>
                <Typography className={classes.descText}>
                  {t('settings.userManagementTab.info')}
                </Typography>

                <Toolbar data-cy="toolBarComponent" className={classes.toolbar}>
                  {/* Search user */}
                  <div className={classes.toolbarFirstCol}>
                    <TextField
                      data-cy="searchField"
                      id="input-with-icon-adornment"
                      placeholder={t('settings.userManagementTab.label.search')}
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
                  </div>

                  {/* filter menu */}
                  <div className={classes.toolbarSecondCol}>
                    <div className={classes.filter}>
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                        color="primary"
                        focused
                      >
                        <InputLabel className={classes.selectText}>
                          {t('settings.userManagementTab.label.userStatus')}
                        </InputLabel>
                        <Select
                          label="User Status"
                          value={filters.status}
                          onChange={(event) => {
                            setFilters({
                              ...filters,
                              status: event.target.value as string,
                            });
                            setPaginationData({ ...paginationData, pageNo: 0 });
                          }}
                          className={classes.selectText}
                          color="primary"
                        >
                          <MenuItem value="all">
                            {t('settings.userManagementTab.label.options.all')}
                          </MenuItem>
                          <MenuItem value="deactivated">
                            {t(
                              'settings.userManagementTab.label.options.deactivated'
                            )}
                          </MenuItem>
                          <MenuItem value="active">
                            {t(
                              'settings.userManagementTab.label.options.active'
                            )}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <div data-cy="createUser">
                      <ButtonFilled
                        onClick={() => {
                          setShowDiv(true);
                        }}
                      >
                        <div>
                          {t('settings.userManagementTab.button.create')}
                        </div>
                      </ButtonFilled>
                    </div>
                  </div>
                </Toolbar>
                {/* user table */}
                <Paper className={classes.root}>
                  <TableContainer className={classes.table}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow className={classes.TR}>
                          <StyledTableCell className={classes.styledTC}>
                            <Typography className={classes.tableHeader}>
                              {t(
                                'settings.userManagementTab.tableCell.username'
                              )}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography className={classes.tableHeader}>
                              {t('settings.userManagementTab.tableCell.name')}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography className={classes.tableHeader}>
                              {t('settings.userManagementTab.tableCell.email')}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography className={classes.tableHeader}>
                              {t(
                                'settings.userManagementTab.tableCell.userCreated'
                              )}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell />
                          <TableHead />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData && filteredData.length ? (
                          filteredData
                            .slice(
                              paginationData.pageNo *
                                paginationData.rowsPerPage,
                              paginationData.pageNo *
                                paginationData.rowsPerPage +
                                paginationData.rowsPerPage
                            )
                            .map((row) => {
                              return (
                                <TableData
                                  row={row}
                                  handleEditDiv={() => setEditDiv(true)}
                                  handleCurrRow={(row: UserData) => {
                                    setCurrRow(row);
                                  }}
                                />
                              );
                            })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography>
                                {t('settings.userManagementTab.noUsers')}
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
          )}
        </div>
      )}
    </div>
  );
};
export default UserManagement;
