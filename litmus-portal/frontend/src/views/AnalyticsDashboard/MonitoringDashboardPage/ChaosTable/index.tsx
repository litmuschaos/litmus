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
  showCheckBoxes: Boolean;
  chaosList: ChaosEventDetails[];
  selectEvents: (selectedEvents: string[]) => void;
}

const ChaosTable: React.FC<ChaosTableProps> = ({
  chaosList,
  selectEvents,
  showCheckBoxes,
}) => {
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
      <div className={classes.tableFix}>
        <div>
          <section className="table section">
            <Paper className={classes.tableBody}>
              <TableContainer className={classes.tableMain}>
                <Table aria-label="simple table">
                  <TableHeader
                    onSelectAllClick={handleSelectAllClick}
                    numSelected={selected.length}
                    rowCount={chaosList.length}
                    showCheckBox={chaosList.length ? showCheckBoxes : false}
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
                                showCheckBox={showCheckBoxes}
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
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 75 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={chaosList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                className={classes.pagination}
              />
            </Paper>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChaosTable;
