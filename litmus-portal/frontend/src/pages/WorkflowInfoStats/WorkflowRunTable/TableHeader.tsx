import { IconButton, TableHead, TableRow } from '@material-ui/core';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles, { StyledTableCell } from './styles';

interface SortData {
  lastRun: { sort: boolean; ascending: boolean };
  resultingPoint: { sort: boolean; ascending: boolean };
  testWeight: { sort: boolean; ascending: boolean };
}

interface SortCallBackType {
  (sortConfigurations: SortData): void;
}

interface TableHeaderProps {
  callBackToSort: SortCallBackType;
}

const TableHeader: React.FC<TableHeaderProps> = ({ callBackToSort }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  // State for sorting
  const [sortData, setSortData] = useState<SortData>({
    testWeight: { sort: false, ascending: true },
    lastRun: { sort: true, ascending: false },
    resultingPoint: { sort: false, ascending: true },
  });

  useEffect(() => {
    callBackToSort(sortData);
  }, [sortData]);

  return (
    <TableHead>
      <TableRow className={classes.tableHead}>
        <StyledTableCell className={classes.testName}>
          <div className={classes.nameContent}>
            <b>{t('observability.workflowRunDetailsTable.tableHead0')}</b>&nbsp;
          </div>
        </StyledTableCell>
        <StyledTableCell>
          <div className={classes.nameContent}>
            <b>{t('observability.workflowRunDetailsTable.tableHead1')}</b>&nbsp;
          </div>
        </StyledTableCell>

        <StyledTableCell>
          <div className={classes.nameContent}>
            <b>{t('observability.workflowRunDetailsTable.tableHead2')}</b>&nbsp;
          </div>
        </StyledTableCell>

        <StyledTableCell>
          <div className={classes.nameContent}>
            <b>{t('observability.workflowRunDetailsTable.tableHead3')}</b>&nbsp;
            <div>
              <IconButton
                aria-label="sort run ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    testWeight: { sort: true, ascending: true },
                    lastRun: { sort: false, ascending: true },
                    resultingPoint: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon />
              </IconButton>
              <IconButton
                aria-label="sort run descending"
                size="small"
                onClick={() => {
                  setSortData({
                    ...sortData,
                    testWeight: { sort: true, ascending: false },
                    lastRun: { sort: false, ascending: false },
                    resultingPoint: { sort: false, ascending: true },
                  });
                }}
              >
                <ExpandMoreTwoToneIcon />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell>
          <div className={classes.nameContent}>
            <b>{t('observability.workflowRunDetailsTable.tableHead4')}</b>&nbsp;
            <div>
              <IconButton
                aria-label="sort run ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    testWeight: { sort: false, ascending: true },
                    lastRun: { sort: false, ascending: true },
                    resultingPoint: { sort: true, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon />
              </IconButton>
              <IconButton
                aria-label="sort run descending"
                size="small"
                onClick={() => {
                  setSortData({
                    ...sortData,
                    testWeight: { sort: false, ascending: true },
                    lastRun: { sort: false, ascending: false },
                    resultingPoint: { sort: true, ascending: false },
                  });
                }}
              >
                <ExpandMoreTwoToneIcon />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell>
          <div className={classes.nameContent}>
            <b>{t('observability.workflowRunDetailsTable.tableHead5')}</b>&nbsp;
            <div>
              <IconButton
                aria-label="sort run ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    testWeight: { sort: false, ascending: true },
                    lastRun: { sort: true, ascending: true },
                    resultingPoint: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon />
              </IconButton>
              <IconButton
                aria-label="sort run descending"
                size="small"
                onClick={() => {
                  setSortData({
                    ...sortData,
                    testWeight: { sort: false, ascending: true },
                    lastRun: { sort: true, ascending: false },
                    resultingPoint: { sort: false, ascending: true },
                  });
                }}
              >
                <ExpandMoreTwoToneIcon />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
