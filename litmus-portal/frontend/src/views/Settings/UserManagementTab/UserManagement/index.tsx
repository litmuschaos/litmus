import {
  createStyles,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
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
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import config from '../../../../config';
import { getToken } from '../../../../utils/auth';
import CreateUser from '../CreateUser';
import EditUser from '../EditUser';
import useStyles from './styles';

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

interface UserData {
  _id: string;
  username: string;
  email: string;
  name: string;
  logged_in: boolean;
  created_at: string;
  updated_at: string;
  removed_at: string;
  state: string;
}

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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
    ?.filter((dataRow) => dataRow.username !== 'admin')
    ?.filter((dataRow) =>
      dataRow.name.toLowerCase().includes(filters.search.toLowerCase())
    )
    .filter((datarow) => {
      if (filters.status === 'all') return true;
      if (filters.status === 'signedin') return datarow.logged_in === true;
      return datarow.logged_in === false;
    });

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [currRow, setCurrRow] = React.useState<UserData>();

  const formatDate = (date: string) => {
    const day = moment(date).format('Do MMM, YYYY LT');
    return day;
  };

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
                    {/* filter menu */}
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
                          <MenuItem value="signedout">
                            {t(
                              'settings.userManagementTab.label.options.notSignedIn'
                            )}
                          </MenuItem>
                          <MenuItem value="signedin">
                            {t(
                              'settings.userManagementTab.label.options.signedIn'
                            )}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                  <div data-cy="createUser">
                    <ButtonFilled
                      handleClick={() => {
                        setShowDiv(true);
                      }}
                      isPrimary
                    >
                      <div>{t('settings.userManagementTab.button.create')}</div>
                    </ButtonFilled>
                  </div>
                </Toolbar>
                {/* user table */}
                <Paper className={classes.root}>
                  <TableContainer className={classes.table}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow className={classes.TR}>
                          <StyledTableCell className={classes.styledTC}>
                            {t('settings.userManagementTab.tableCell.status')}
                          </StyledTableCell>
                          <StyledTableCell>
                            {t('settings.userManagementTab.tableCell.username')}
                          </StyledTableCell>
                          <StyledTableCell>
                            {t('settings.userManagementTab.tableCell.email')}
                          </StyledTableCell>
                          <StyledTableCell>
                            {t(
                              'settings.userManagementTab.tableCell.userCreated'
                            )}
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
                            .map((row, index) => (
                              <TableRow
                                data-cy="userTableRow"
                                key={row.name}
                                className={classes.TR}
                              >
                                <TableCell
                                  className={classes.firstTC}
                                  component="th"
                                  scope="row"
                                >
                                  <div className={classes.firstCol}>
                                    {row.logged_in ? (
                                      <div className={classes.Signed}>
                                        {t(
                                          'settings.userManagementTab.label.options.signedIn'
                                        )}
                                      </div>
                                    ) : (
                                      <div className={classes.NotSigned}>
                                        {t(
                                          'settings.userManagementTab.label.options.notSignedIn'
                                        )}
                                      </div>
                                    )}

                                    {row.name}
                                  </div>
                                </TableCell>
                                <TableCell className={classes.otherTC}>
                                  {row.username}
                                </TableCell>
                                <TableCell className={classes.otherTC}>
                                  {row.email}
                                </TableCell>
                                <TableCell className={classes.otherTC}>
                                  <div className={classes.dateDiv}>
                                    <img
                                      className={classes.calIcon}
                                      src="./icons/calendarIcon.svg"
                                      alt="calendar"
                                    />
                                    {formatDate(row.created_at)}
                                  </div>
                                </TableCell>

                                <TableCell
                                  className={classes.lastTC}
                                  key={row.username}
                                >
                                  <IconButton
                                    data-cy="editUser"
                                    aria-label="more"
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    onClick={(event) => {
                                      setCurrRow(row);
                                      setAnchorEl(event.currentTarget);
                                    }}
                                    className={classes.optionBtn}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                  <Menu
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    id="long-menu"
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                  >
                                    <MenuItem
                                      data-cy="editProfile"
                                      value={index}
                                      onClick={() => {
                                        setEditDiv(true);
                                        setAnchorEl(null);
                                      }}
                                    >
                                      <IconButton disabled>
                                        <img
                                          alt="delete"
                                          src="./icons/Edit.svg"
                                        />
                                      </IconButton>
                                      {t(
                                        'settings.userManagementTab.editProfile'
                                      )}
                                    </MenuItem>
                                    {/* 
                                    <MenuItem
                                      value="delete"
                                      disabled
                                      onClick={() => {}}
                                    >
                                      <IconButton disabled>
                                        <img
                                          alt="delete"
                                          src="./icons/bin.svg"
                                        />
                                      </IconButton>
                                      <Typography>Delete User</Typography>
                                    </MenuItem> */}
                                  </Menu>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Typography align="center">
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
