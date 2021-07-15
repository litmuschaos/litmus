import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Member } from '../../../../models/graphql/user';
import InvitedTableData from './invitedTableData';
import useStyles, { StyledTableCell } from './styles';

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}

interface InvitedTableProps {
  notAcceptedFilteredData: Member[];
  showModal: () => void;
  handleOpen: () => void;
  open: boolean;
}

const InvitedTable: React.FC<InvitedTableProps> = ({
  notAcceptedFilteredData,
  showModal,
  open,
  handleOpen,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.table} elevation={0} component={Paper}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead className={classes.TR}>
            <TableRow className={classes.TR}>
              <StyledTableCell className={classes.firstTC}>
                {t('settings.teamingTab.tableCell.name')}
              </StyledTableCell>
              <StyledTableCell>
                {t('settings.teamingTab.tableCell.role')}
              </StyledTableCell>
              <StyledTableCell>
                {t('settings.teamingTab.tableCell.email')}
              </StyledTableCell>
              <StyledTableCell>
                {t('settings.teamingTab.tableCell.status')}
              </StyledTableCell>
              <StyledTableCell />
              <TableHead />
            </TableRow>
          </TableHead>
          <TableBody>
            {notAcceptedFilteredData?.length > 0 ? (
              notAcceptedFilteredData
                .slice(
                  paginationData.pageNo * paginationData.rowsPerPage,
                  paginationData.pageNo * paginationData.rowsPerPage +
                    paginationData.rowsPerPage
                )
                .map((row, index) => (
                  <TableRow
                    data-cy="teamingTableRow"
                    key={row.user_id}
                    className={classes.TR}
                  >
                    <InvitedTableData
                      index={index}
                      row={row}
                      showModal={showModal}
                      modalOpen={open}
                      handleModalOpen={handleOpen}
                    />
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <StyledTableCell colSpan={5} className={classes.styledTC}>
                  <Typography align="center">
                    {t('settings.teamingTab.noUsers')}
                  </Typography>
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={notAcceptedFilteredData?.length ?? 0}
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
        className={classes.tablePagination}
      />
    </Paper>
  );
};

export default InvitedTable;
