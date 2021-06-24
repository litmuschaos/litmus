import { IconButton, TableHead, TableRow, Typography } from '@material-ui/core';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles, { StyledTableCell } from './styles';

interface SortData {
  lastViewed: { sort: boolean; ascending: boolean };
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
    lastViewed: { sort: true, ascending: false },
  });

  useEffect(() => {
    callBackToSort(sortData);
  }, [sortData]);

  return (
    <TableHead>
      <TableRow className={classes.tableHead}>
        <StyledTableCell
          className={`${classes.headSpacing} ${classes.columnDivider}`}
        >
          <div className={classes.nameContent}>
            <Typography
              className={`${classes.dashboardNameHead} ${classes.dashboardNameCol}`}
            >
              {t('analyticsDashboard.dashboardTable.tableHead1')}
            </Typography>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort name ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: true, ascending: true },
                    lastViewed: { sort: false, ascending: true },
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
                    lastViewed: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell
          className={`${classes.headSpacing} ${classes.dividerPadding}`}
        >
          <Typography
            className={`${classes.dashboardNameHead} ${classes.dashboardNameHeadWithoutSort}`}
          >
            {t('analyticsDashboard.dashboardTable.tableHead2')}
          </Typography>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <Typography
            className={`${classes.dashboardNameHead} ${classes.dashboardNameHeadWithoutSort}`}
          >
            {t('analyticsDashboard.dashboardTable.tableHead3')}
          </Typography>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <Typography
            className={`${classes.dashboardNameHead} ${classes.dashboardNameHeadWithoutSort}`}
          >
            {t('analyticsDashboard.dashboardTable.tableHead4')}
          </Typography>
        </StyledTableCell>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <Typography className={classes.dashboardNameHead}>
              {t('analyticsDashboard.dashboardTable.tableHead5')}
            </Typography>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort last viewed ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: true, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort last viewed descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: true, ascending: false },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
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
