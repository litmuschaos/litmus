import { IconButton, TableRow } from '@material-ui/core';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckBox } from '../../../../components/CheckBox';
import useStyles, { StyledTableCell } from './styles';

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
    <TableRow className={classes.tableHead}>
      <StyledTableCell padding="checkbox" className={classes.checkbox}>
        {comparisonState === false ? (
          <CheckBox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        ) : (
          <div />
        )}
      </StyledTableCell>
      <StyledTableCell className={classes.workflowName}>
        <div className={classes.nameContent}>
          <div className={classes.workflowNameHead}>
            {t('observability.tableHead1')} &nbsp;
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
              <ExpandLessTwoToneIcon className={classes.markerIcon} />
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
              <ExpandMoreTwoToneIcon className={classes.markerIcon} />
            </IconButton>
          </div>
        </div>
      </StyledTableCell>
      <StyledTableCell className={classes.headSpacing}>
        <div className={classes.nameContent}>
          <div className={classes.workflowNameHead}>
            {t('observability.tableHead2')}&nbsp;
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
              <ExpandLessTwoToneIcon className={classes.markerIcon} />
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
              <ExpandMoreTwoToneIcon className={classes.markerIcon} />
            </IconButton>
          </div>
        </div>
      </StyledTableCell>
      <StyledTableCell className={classes.headSpacing}>
        <div className={classes.nameContent}>
          {t('observability.tableHead3')}&nbsp;
        </div>
      </StyledTableCell>
      <StyledTableCell className={classes.headSpacing}>
        <div className={classes.nameContent}>
          <div className={classes.workflowNameHead}>
            {t('observability.tableHead4')}&nbsp;
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
              <ExpandLessTwoToneIcon className={classes.markerIcon} />
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
              <ExpandMoreTwoToneIcon className={classes.markerIcon} />
            </IconButton>
          </div>
        </div>
      </StyledTableCell>
      <StyledTableCell />
    </TableRow>
  );
};

export default TableHeader;
