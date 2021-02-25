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
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import useStyles, { StyledTableCell } from './styles';
import TableData from './TableData';
import { ExecutionData, Node } from '../../../models/graphql/workflowData';

interface NodeTableProps {
  data: ExecutionData;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}

const NodeTable: React.FC<NodeTableProps> = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  const [nodesArray, setNodesArray] = useState<Node[]>([]);

  useEffect(() => {
    const filteredNodes: Node[] = [];
    Object.keys(data.nodes).forEach((key) => {
      if (data.nodes[key].type !== 'StepGroup') {
        filteredNodes.push(data.nodes[key]);
      }
    });
    setNodesArray([...filteredNodes]);
  }, [data]);

  return (
    <Paper className={classes.root}>
      {/* Table Header Section */}
      <TableContainer
        data-cy="browseScheduleTable"
        className={classes.tableMain}
      >
        <Table stickyHeader aria-label="simple table">
          <TableHead className={classes.tableHead}>
            <TableRow className={classes.tableRows}>
              {/* Step Name */}
              <StyledTableCell className={classes.columnWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.stepName')}
                </Typography>
              </StyledTableCell>

              {/* Status */}
              <StyledTableCell className={classes.columnWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.status')}
                </Typography>
              </StyledTableCell>

              {/* Duration of Node execution */}
              <StyledTableCell className={classes.columnWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.duration')}
                </Typography>
              </StyledTableCell>

              {/* Start Time */}
              <StyledTableCell className={classes.columnWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.startTime')}
                </Typography>
              </StyledTableCell>

              {/* Application Details */}
              <StyledTableCell className={classes.columnWidth}>
                <Typography>
                  {t(
                    'workflowDetailsView.tableView.tableHeader.applicationDetails'
                  )}
                </Typography>
              </StyledTableCell>

              <StyledTableCell className={classes.columnWidth}>
                <Typography />
              </StyledTableCell>
            </TableRow>
          </TableHead>

          {/* Table Body Section */}
          <TableBody>
            {(nodesArray as Node[])
              .slice(
                paginationData.pageNo * paginationData.rowsPerPage,
                paginationData.pageNo * paginationData.rowsPerPage +
                  paginationData.rowsPerPage
              )
              .map((node: Node) => (
                <TableRow data-cy="browseScheduleData">
                  <TableData data={node} />
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination Section */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={nodesArray.length}
        rowsPerPage={paginationData.rowsPerPage}
        page={paginationData.pageNo}
        onChangePage={(_, page) =>
          setPaginationData({ ...paginationData, pageNo: page })
        }
        onChangeRowsPerPage={(event) => {
          setPaginationData({
            ...paginationData,
            pageNo: 0,
            rowsPerPage: parseInt(event.target.value, 10),
          });
        }}
        className={classes.pagination}
      />
    </Paper>
  );
};
export default NodeTable;
