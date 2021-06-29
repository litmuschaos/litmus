import { TableHead, TableRow } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckBox } from '../../../../components/CheckBox';
import InfoTooltip from '../../../../components/InfoTooltip';
import { StyledTableCell } from '../../../../components/StyledTableCell';
import useStyles from './styles';

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
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameHead}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead1'
            )}
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameHead}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead2'
            )}
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameHead}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead3'
            )}
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameHead}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead4'
            )}
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameHead}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead5.title'
            )}
            <InfoTooltip
              value={t(
                'analyticsDashboard.monitoringDashboardPage.chaosTable.tableHead5.infoText'
              )}
            />
          </div>
        </StyledTableCell>
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
