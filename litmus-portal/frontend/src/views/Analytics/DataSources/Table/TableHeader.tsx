import { IconButton, TableHead, TableRow, Typography } from '@material-ui/core';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles, { StyledTableCell } from './styles';

interface SortData {
  lastConfigured: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
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
    name: { sort: false, ascending: true },
    lastConfigured: { sort: true, ascending: false },
  });

  useEffect(() => {
    callBackToSort(sortData);
  }, [sortData]);

  return (
    <TableHead>
      <TableRow>
        <StyledTableCell className={classes.headSpacing}>
          <Typography
            className={`${classes.dataSourceNameHead} ${classes.dataSourceStatusHeadWithoutSort}`}
          >
            {t('analyticsDashboard.dataSourceTable.tableHead1')}
          </Typography>
        </StyledTableCell>

        <StyledTableCell
          className={`${classes.headSpacing} ${classes.columnDivider}`}
        >
          <div className={classes.flexDisplay}>
            <Typography className={`${classes.dataSourceNameHead}`}>
              {t('analyticsDashboard.dataSourceTable.tableHead2')}
            </Typography>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort name ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: true, ascending: true },
                    lastConfigured: { sort: false, ascending: true },
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
                    lastConfigured: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIcon} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>

        <StyledTableCell
          className={`${classes.headSpacing} ${classes.dividerPadding}`}
        >
          <Typography
            className={`${classes.dataSourceNameHead} ${classes.dataSourceNameHeadWithoutSort}`}
          >
            {t('analyticsDashboard.dataSourceTable.tableHead3')}
          </Typography>
        </StyledTableCell>

        <StyledTableCell className={classes.headSpacing}>
          <Typography
            className={`${classes.dataSourceNameHead} ${classes.dataSourceNameHeadWithoutSort}`}
          >
            {t('analyticsDashboard.dataSourceTable.tableHead4')}
          </Typography>
        </StyledTableCell>

        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.flexDisplay}>
            <Typography className={classes.dataSourceNameHead}>
              {t('analyticsDashboard.dataSourceTable.tableHead5')}
            </Typography>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort last configured ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: true, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIcon} />
              </IconButton>
              <IconButton
                aria-label="sort last configured descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: true, ascending: false },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIcon} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.options} />
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
