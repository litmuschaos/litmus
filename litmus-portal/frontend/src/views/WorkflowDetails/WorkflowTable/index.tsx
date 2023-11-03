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
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExecutionData, Node } from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as NodeSelectionActions from '../../../redux/actions/nodeSelection';
import { stepEmbeddedYAMLExtractor } from '../../../utils/yamlUtils';
import useStyles, { StyledTableCell } from './styles';
import TableData from './TableData';

interface NodeTableProps {
  manifest: string;
  data: ExecutionData;
  handleClose: () => void;
}

interface SelectedNodeType extends Node {
  id: string;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}

const NodeTable: React.FC<NodeTableProps> = ({
  data,
  handleClose,
  manifest,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  const [nodesArray, setNodesArray] = useState<SelectedNodeType[]>([]);
  const nodeSelection = useActions(NodeSelectionActions);

  const changeNodeLogs = (selectedKey: string) => {
    nodeSelection.selectNode({
      ...data.nodes[selectedKey],
      podName: selectedKey,
    });
  };

  useEffect(() => {
    const filteredNodes: SelectedNodeType[] = [];
    Object.keys(data.nodes).forEach((key) => {
      if (
        data.nodes[key].type !== 'StepGroup' &&
        data.nodes[key].type !== 'Steps'
      ) {
        filteredNodes.push({ ...data.nodes[key], id: key });
      }
    });
    setNodesArray([...filteredNodes]);
  }, [data]);

  return (
    <>
      <Paper className={classes.root}>
        {/* Table Header Section */}
        <TableContainer
          data-cy="browseScheduleTable"
          className={classes.tableMain}
        >
          <Table stickyHeader aria-label="simple table">
            <TableHead className={classes.tableHead}>
              {/* Step Name */}
              <StyledTableCell className={classes.tableCellWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.stepName')}
                </Typography>
              </StyledTableCell>

              {/* Status */}
              <StyledTableCell className={classes.tableCellWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.status')}
                </Typography>
              </StyledTableCell>

              {/* Start Time */}
              <StyledTableCell className={classes.tableCellWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.startTime')}
                </Typography>
              </StyledTableCell>

              {/* End Time of Node execution */}
              <StyledTableCell className={classes.tableCellWidth}>
                <Typography>
                  {t('workflowDetailsView.tableView.tableHeader.endTime')}
                </Typography>
              </StyledTableCell>

              {/* Application Details */}
              <StyledTableCell className={classes.tableCellWidth}>
                <Typography>
                  {t(
                    'workflowDetailsView.tableView.tableHeader.applicationDetails'
                  )}
                </Typography>
              </StyledTableCell>

              <StyledTableCell className={classes.tableCellWidth}>
                <Typography />
              </StyledTableCell>
            </TableHead>

            {/* Table Body Section */}
            <TableBody>
              {(nodesArray as SelectedNodeType[])
                .slice(
                  paginationData.pageNo * paginationData.rowsPerPage,
                  paginationData.pageNo * paginationData.rowsPerPage +
                    paginationData.rowsPerPage
                )
                .map((node: SelectedNodeType) => {
                  const stepYAML = stepEmbeddedYAMLExtractor(
                    manifest,
                    node.name
                  );
                  return (
                    <TableRow key={node.id} className={classes.tableRows}>
                      <TableData
                        onViewLogsClick={() => changeNodeLogs(node.id)}
                        embeddedYAML={stepYAML}
                        data={node}
                        handleClose={() => handleClose()}
                      />
                    </TableRow>
                  );
                })}
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
    </>
  );
};
export default NodeTable;
