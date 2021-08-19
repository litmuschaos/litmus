import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../components/Loader';
import { ChaosEventDetails } from '../../../../models/dashboardsData';
import useStyles from './styles';
import TableData from './TableData';
import TableHeader from './TableHeader';
import TableToolBar from './TableToolbar';

interface ChaosTableProps {
  isLoading: boolean;
  chaosList: ChaosEventDetails[];
  selectEvents: (selectedEvents: string[]) => void;
}

interface Filter {
  selectedWorkflow: string;
  selectedContext: string;
  selectedVerdict: string;
  searchTokens: string[];
}

const ChaosTable: React.FC<ChaosTableProps> = ({
  isLoading,
  chaosList,
  selectEvents,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selected, setSelected] = React.useState<string[]>([]);
  const isSelected = (name: string) => selected.indexOf(name) !== -1;
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, chaosList.length - page * rowsPerPage);
  const [filter, setFilter] = React.useState<Filter>({
    selectedWorkflow: 'All',
    selectedContext: 'All',
    selectedVerdict: 'All',
    searchTokens: [''],
  });

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
      const newSelecteds = chaosList
        .filter((chaos) => !chaos.injectionFailed)
        .map((n: ChaosEventDetails) => n.id);
      setSelected(newSelecteds);
      selectEvents(newSelecteds);
      return;
    }
    setSelected([]);
    selectEvents([]);
  };

  const handleClick = (name: string, injectionFailed: boolean) => {
    if (!injectionFailed) {
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
      selectEvents(newSelected);
    }
  };

  const payload: ChaosEventDetails[] = chaosList
    .filter((chaosEvent: ChaosEventDetails) => {
      return filter.searchTokens.every((s: string) =>
        chaosEvent.chaosResultName.toLowerCase().includes(s)
      );
    })
    .filter((data) => {
      return filter.selectedWorkflow === 'All'
        ? true
        : data.workflow === filter.selectedWorkflow;
    })
    .filter((data) => {
      return filter.selectedContext === 'All'
        ? true
        : data.engineContext === filter.selectedContext;
    })
    .filter((data) => {
      return filter.selectedVerdict === 'All'
        ? true
        : data.verdict === filter.selectedVerdict;
    });

  return (
    <div className={classes.root} id="chaos">
      <div>
        <section className="table section">
          <Paper className={classes.tableBody}>
            <TableToolBar
              searchToken={filter.searchTokens[0]}
              handleSearch={(
                event: React.ChangeEvent<{ value: unknown }> | undefined,
                token: string | undefined
              ) => {
                setFilter({
                  ...filter,
                  searchTokens: (event !== undefined
                    ? ((event.target as HTMLInputElement).value as string)
                    : token || ''
                  )
                    .toLowerCase()
                    .split(' ')
                    .filter((s) => s !== ''),
                });
                setPage(0);
              }}
              workflows={[
                ...Array.from(
                  new Set(chaosList.map((chaosEvent) => chaosEvent.workflow))
                ),
              ]}
              contexts={[
                ...Array.from(
                  new Set(
                    chaosList
                      .map((chaosEvent) => chaosEvent.engineContext)
                      .filter((context) => context !== '')
                  )
                ),
              ]}
              verdicts={[
                ...Array.from(
                  new Set(chaosList.map((chaosEvent) => chaosEvent.verdict))
                ),
              ]}
              callbackToSetWorkflow={(workflow: string) => {
                setFilter({
                  ...filter,
                  selectedWorkflow: workflow,
                });
                setPage(0);
              }}
              callbackToSetContext={(context: string) => {
                setFilter({
                  ...filter,
                  selectedContext: context,
                });
                setPage(0);
              }}
              callbackToSetVerdict={(verdict: string) => {
                setFilter({
                  ...filter,
                  selectedVerdict: verdict,
                });
                setPage(0);
              }}
            />
            <TableContainer
              className={`${classes.tableMain} ${
                isLoading || !chaosList.length ? classes.empty : ''
              }`}
            >
              <Table aria-label="simple table">
                <TableHeader
                  onSelectAllClick={handleSelectAllClick}
                  numSelected={selected.length}
                  rowCount={
                    chaosList.filter((chaos) => !chaos.injectionFailed).length
                  }
                />
                <TableBody>
                  {!isLoading && chaosList.length ? (
                    payload
                      .slice(0)
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((data: ChaosEventDetails, index: number) => {
                        const isItemSelected = isSelected(data.id);
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                          <TableRow
                            hover={!data.injectionFailed}
                            onClick={() =>
                              handleClick(data.id, data.injectionFailed)
                            }
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={data.id}
                            selected={isItemSelected && !data.injectionFailed}
                          >
                            <TableData
                              data={data}
                              itemSelectionStatus={isItemSelected}
                              labelIdentifier={labelId}
                            />
                          </TableRow>
                        );
                      })
                  ) : isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div
                          className={`${classes.noRecords} ${classes.loading}`}
                        >
                          <Loader />
                          <Typography align="center">
                            {t(
                              'monitoringDashboard.monitoringDashboardPage.chaosTable.loading'
                            )}
                          </Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className={classes.noRecords}>
                          <img
                            src="./icons/dashboardUnavailable.svg"
                            className={classes.cloudIcon}
                            alt="Chaos event unavailable"
                          />
                          <Typography
                            align="center"
                            className={classes.noRecordsText}
                          >
                            {t(
                              'monitoringDashboard.monitoringDashboardPage.chaosTable.noRecords'
                            )}
                          </Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && chaosList.length > 0 && emptyRows > 0 && (
                    <TableRow style={{ height: 75 * emptyRows }}>
                      <TableCell colSpan={5} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {!isLoading && chaosList.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={payload.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
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
            )}
          </Paper>
        </section>
      </div>
    </div>
  );
};

export default ChaosTable;
