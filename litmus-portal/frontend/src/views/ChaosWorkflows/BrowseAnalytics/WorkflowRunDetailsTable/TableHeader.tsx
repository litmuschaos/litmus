import {
  TableHead,
  TableRow,
  TableCell,
  Typography,
  IconButton,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import ExpandLessTwoToneIcon from '@material-ui/icons/ExpandLessTwoTone';
import ButtonOutline from '../../../../components/Button/ButtonOutline';
import useStyles from './styles';

interface SortData {
  lastRun: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  testResult: { sort: boolean; ascending: boolean };
}

interface SortCallBackType {
  (sortConfigurations: SortData): void;
}

interface CloseCallBackType {
  (close: boolean): void;
}

interface TableHeaderProps {
  callBackToSort: SortCallBackType;
  callBackToClose: CloseCallBackType;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  callBackToSort,
  callBackToClose,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  // State for sorting
  const [sortData, setSortData] = useState<SortData>({
    name: { sort: false, ascending: true },
    lastRun: { sort: true, ascending: false },
    testResult: { sort: false, ascending: true },
  });

  useEffect(() => {
    callBackToSort(sortData);
  }, [sortData]);

  return (
    <TableHead>
      <TableRow className={classes.tableHead}>
        <TableCell className={classes.testName}>
          <div className={classes.nameContent}>
            <div className={classes.testNameHead}>
              <b>{t('analytics.workflowRunDetailsTable.tableHead1')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort name ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: true, ascending: true },
                    lastRun: { sort: false, ascending: true },
                    testResult: { sort: false, ascending: true },
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
                    lastRun: { sort: false, ascending: true },
                    testResult: { sort: false, ascending: true },
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
            <div className={classes.testResultHead}>
              <b>{t('analytics.workflowRunDetailsTable.tableHead2')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort result ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastRun: { sort: false, ascending: true },
                    testResult: { sort: true, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort result descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastRun: { sort: false, ascending: true },
                    testResult: { sort: true, ascending: false },
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
            <div className={classes.testWeightPointHead}>
              <b>{t('analytics.workflowRunDetailsTable.tableHead3')}</b>&nbsp;
            </div>
          </div>
        </TableCell>
        <TableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.testWeightPointHead}>
              <b>{t('analytics.workflowRunDetailsTable.tableHead4')}</b>&nbsp;
            </div>
          </div>
        </TableCell>
        <TableCell className={classes.headSpacing}>
          <div className={classes.nameContent}>
            <div className={classes.testNameHead}>
              <b>{t('analytics.workflowRunDetailsTable.tableHead5')}</b>&nbsp;
            </div>
            <div className={classes.nameContentIcons}>
              <IconButton
                aria-label="sort run ascending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastRun: { sort: true, ascending: true },
                    testResult: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandLessTwoToneIcon className={classes.markerIconUp} />
              </IconButton>
              <IconButton
                aria-label="sort run descending"
                size="small"
                onClick={() =>
                  setSortData({
                    ...sortData,
                    name: { sort: false, ascending: true },
                    lastRun: { sort: true, ascending: false },
                    testResult: { sort: false, ascending: true },
                  })
                }
              >
                <ExpandMoreTwoToneIcon className={classes.markerIconDown} />
              </IconButton>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <ButtonOutline
            handleClick={() => {
              callBackToClose(true);
            }}
            isDisabled={false}
          >
            <Typography className={classes.dateRangeDefault}>
              {t('analytics.workflowRunDetailsTable.close')}
            </Typography>
          </ButtonOutline>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
