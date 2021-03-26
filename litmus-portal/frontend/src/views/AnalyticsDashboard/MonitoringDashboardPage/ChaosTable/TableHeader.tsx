import { TableHead, TableRow } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckBox from '../../../../components/CheckBox';
import useStyles, { StyledTableCell } from './styles';

interface TableHeaderProps {
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  numSelected: number;
  rowCount: number;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  onSelectAllClick,
  numSelected,
  rowCount,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <TableHead>
      <TableRow className={classes.tableHead}>
        <StyledTableCell padding="checkbox" className={classes.checkbox}>
          <CheckBox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </StyledTableCell>
        <StyledTableCell className={classes.workflowName}>
          <div className={classes.nameContent}>
            <div className={classes.workflowNameHead}>
              <b>{t('analytics.tableHead1')} </b>&nbsp;
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.workflowNameHead}>
              <b>{t('analytics.tableHead2')}</b>&nbsp;
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <b>{t('analytics.tableHead3')}</b>&nbsp;
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.workflowNameHead}>
              <b>{t('analytics.tableHead4')}</b>&nbsp;
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.workflowNameHead}>
              <b>{t('analytics.tableHead4')}</b>&nbsp;
            </div>
          </div>
        </StyledTableCell>
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
