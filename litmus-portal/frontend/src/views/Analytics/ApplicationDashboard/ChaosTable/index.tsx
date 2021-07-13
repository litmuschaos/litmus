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
import { ChaosEventDetails } from '../../../../models/dashboardsData';
import useStyles from './styles';
import TableData from './TableData';
import TableHeader from './TableHeader';

interface ChaosTableProps {
  chaosList: ChaosEventDetails[];
  selectEvents: (selectedEvents: string[]) => void;
}

const ChaosTable: React.FC<ChaosTableProps> = ({ chaosList, selectEvents }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selected, setSelected] = React.useState<string[]>([]);
  const isSelected = (name: string) => selected.indexOf(name) !== -1;
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, chaosList.length - page * rowsPerPage);

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
      const newSelecteds = chaosList.map((n: ChaosEventDetails) => n.id);
      setSelected(newSelecteds);
      selectEvents(newSelecteds);
      return;
    }
    setSelected([]);
    selectEvents([]);
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
    selectEvents(newSelected);
  };

  return (
    <div className={classes.root} id="chaos">
      <div>
        <section className="table section">
          <Paper className={classes.tableBody}>
            <TableContainer
              className={`${classes.tableMain} ${
                !chaosList.length ? classes.empty : ''
              }`}
            >
              <Table aria-label="simple table">
                <TableHeader
                  onSelectAllClick={handleSelectAllClick}
                  numSelected={selected.length}
                  rowCount={chaosList.length}
                />
                <TableBody>
                  {chaosList.length ? (
                    chaosList
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
                            hover
                            onClick={() => {
                              handleClick(data.id);
                            }}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={data.id}
                            selected={isItemSelected}
                          >
                            <TableData
                              data={data}
                              itemSelectionStatus={isItemSelected}
                              labelIdentifier={labelId}
                            />
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>
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
                              'analyticsDashboard.monitoringDashboardPage.chaosTable.noRecords'
                            )}
                          </Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {chaosList.length > 0 && emptyRows > 0 && (
                    <TableRow style={{ height: 75 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {chaosList.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={chaosList.length}
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
