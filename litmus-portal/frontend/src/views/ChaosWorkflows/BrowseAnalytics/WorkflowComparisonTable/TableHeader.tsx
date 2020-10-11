import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import useStyles from './styles';

interface SortData {
  startDate: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  cluster: { sort: boolean; ascending: boolean };
}

interface SortCallBackType {
  (sortConfigurations: SortData): void;
}

interface TableHeaderProps {
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  numSelected: number;
  rowCount: number;
  comparisonState: Boolean;
  callBackToSort: SortCallBackType;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  onSelectAllClick,
  numSelected,
  rowCount,
  comparisonState,
  callBackToSort,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  // State for sorting
  const [sortData, setSortData] = useState<SortData>({
    name: { sort: false, ascending: true },
    startDate: { sort: true, ascending: false },
    cluster: { sort: false, ascending: true },
  });

  useEffect(() => {
    callBackToSort(sortData);
  }, [sortData]);

  return (
    <TableHead>
      <TableRow className={classes.tableHead}>
        <TableCell padding="checkbox" className={classes.checkbox}>
          {comparisonState === false ? (
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all desserts' }}
            />
          ) : (
            <div />
          )}
        </TableCell>
        <TableCell className={classes.workflowName}>
          <div className={classes.nameContent}>
            <div className={classes.workflowNameHead}>
              <b>{t('analytics.tableHead1')} </b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort name ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: true, ascending: true },
                    startDate: { sort: false, ascending: true },
                    cluster: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort name descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: true, ascending: false },
                    startDate: { sort: false, ascending: true },
                    cluster: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </TableCell>
        <TableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.workflowNameHead}>
              <b>{t('analytics.tableHead2')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort date ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    startDate: { sort: true, ascending: true },
                    cluster: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort date descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    startDate: { sort: true, ascending: false },
                    cluster: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </TableCell>
        <TableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            &nbsp;&nbsp;<b>{t('analytics.tableHead3')}</b>&nbsp;
          </div>
        </TableCell>
        <TableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.workflowNameHead}>
              <b>{t('analytics.tableHead4')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort cluster ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    startDate: { sort: false, ascending: true },
                    cluster: { sort: true, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort cluster descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    startDate: { sort: false, ascending: true },
                    cluster: { sort: true, ascending: false },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
