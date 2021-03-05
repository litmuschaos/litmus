import { IconButton, TableHead, TableRow } from '@material-ui/core';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles, { StyledTableCell } from './styles';

interface SortData {
  lastViewed: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  agent: { sort: boolean; ascending: boolean };
  dataSourceType: { sort: boolean; ascending: boolean };
  dashboardType: { sort: boolean; ascending: boolean };
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
    agent: { sort: false, ascending: true },
    dataSourceType: { sort: false, ascending: true },
    dashboardType: { sort: false, ascending: true },
  });

  useEffect(() => {
    callBackToSort(sortData);
  }, [sortData]);

  return (
    <TableHead>
      <TableRow className={classes.tableHead}>
        <StyledTableCell className={classes.dashboardName}>
          <div className={classes.nameContent}>
            <div className={classes.dashboardNameHead}>
              <b>{t('analyticsDashboard.dashboardTable.tableHead1')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort name ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: true, ascending: true },
                    lastViewed: { sort: false, ascending: true },
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: false, ascending: true },
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
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.tableHeader}>
          <div className={classes.nameContent}>
            <div className={classes.dashboardNameHead}>
              <b>{t('analyticsDashboard.dashboardTable.tableHead2')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort agent name ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: false, ascending: true },
                    agent: { sort: true, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort agent name descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: false, ascending: true },
                    agent: { sort: true, ascending: false },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.tableHeader}>
          <div className={classes.nameContent}>
            <div className={classes.dashboardNameHead}>
              <b>{t('analyticsDashboard.dashboardTable.tableHead3')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort dashboard type ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: false, ascending: true },
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: true, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort dashboard type descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: false, ascending: true },
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: true, ascending: false },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.tableHeader}>
          <div className={classes.nameContent}>
            <div className={classes.dashboardNameHead}>
              <b>{t('analyticsDashboard.dashboardTable.tableHead4')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort data source type ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: false, ascending: true },
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: true, ascending: true },
                    dashboardType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort data source type descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: false, ascending: true },
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: true, ascending: false },
                    dashboardType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.tableHeader}>
          <div className={classes.nameContent}>
            <div className={classes.dashboardNameHead}>
              <b>{t('analyticsDashboard.dashboardTable.tableHead5')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort last viewed ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastViewed: { sort: true, ascending: true },
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: false, ascending: true },
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
                    agent: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                    dashboardType: { sort: false, ascending: true },
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
