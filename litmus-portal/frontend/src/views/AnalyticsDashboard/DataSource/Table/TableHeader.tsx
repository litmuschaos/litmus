import { IconButton, TableHead, TableRow } from '@material-ui/core';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStyles, { StyledTableCell } from './styles';

interface SortData {
  lastConfigured: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  status: { sort: boolean; ascending: boolean };
  dataSourceType: { sort: boolean; ascending: boolean };
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
    status: { sort: false, ascending: true },
    dataSourceType: { sort: false, ascending: true },
  });

  useEffect(() => {
    callBackToSort(sortData);
  }, [sortData]);

  return (
    <TableHead>
      <TableRow className={classes.tableHead}>
        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.dataSourceStatusHead}>
              <b>{t('analyticsDashboard.dataSourceTable.tableHead1')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort status ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: false, ascending: true },
                    status: { sort: true, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort status descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: false, ascending: true },
                    status: { sort: true, ascending: false },
                    dataSourceType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>

        <StyledTableCell className={classes.dataSourceName}>
          <div className={classes.nameContent}>
            <div className={classes.dataSourceNameHead}>
              <b>{t('analyticsDashboard.dataSourceTable.tableHead2')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort name ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: true, ascending: true },
                    lastConfigured: { sort: false, ascending: true },
                    status: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
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
                    lastConfigured: { sort: false, ascending: true },
                    status: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>

        <StyledTableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.dataSourceNameHead}>
              <b>{t('analyticsDashboard.dataSourceTable.tableHead3')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort datasource type ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: false, ascending: true },
                    status: { sort: false, ascending: true },
                    dataSourceType: { sort: true, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort datasource type descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: false, ascending: true },
                    status: { sort: false, ascending: true },
                    dataSourceType: { sort: true, ascending: false },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>

        <StyledTableCell className={classes.dataSourceName}>
          <div className={classes.nameContent}>
            <div className={classes.dataSourceNameHead}>
              <b>{t('analyticsDashboard.dataSourceTable.tableHead4')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort last configured ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: true, ascending: true },
                    status: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort last configured descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastConfigured: { sort: true, ascending: false },
                    status: { sort: false, ascending: true },
                    dataSourceType: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </StyledTableCell>
        <StyledTableCell className={classes.options} />
        <StyledTableCell className={classes.options} />
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
