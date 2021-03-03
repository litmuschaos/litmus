import { Button, Typography } from '@material-ui/core';
import React from 'react';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import timeDifference from '../../../utils/datesModifier';
import useStyles, { StyledTableCell } from './styles';
import { ExecutionData } from '../../../models/graphql/workflowData';

interface TableDataProps {
  data: ExecutionData['nodes'][0];
  handleClose: () => void;
}

const TableData: React.FC<TableDataProps> = ({ data, handleClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <StyledTableCell className={classes.tableCellWidth}>
        <Typography>
          <span className={classes.disabledText}>
            <strong>{data.name}</strong>
          </span>
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <div className={classes.status}>
          <span className={classes.icon}>
            <img
              className={
                data.phase.toLowerCase() === 'running'
                  ? classes.runningSmallIcon
                  : ''
              }
              src={`/icons/${data.phase.toLowerCase()}.svg`}
              alt="status"
            />
          </span>
          <Typography>
            {data.phase === 'Succeeded' ? (
              <span className={classes.succeeded}>
                <strong>{data.phase}</strong>
              </span>
            ) : data.phase === 'failed' ? (
              <span className={classes.failed}>
                <strong>{data.phase}</strong>
              </span>
            ) : data.phase === 'Running' ? (
              <span className={classes.running}>
                <strong>{data.phase}</strong>
              </span>
            ) : (
              <span className={classes.pending}>
                <strong>{data.phase}</strong>
              </span>
            )}
          </Typography>
        </div>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <Typography>
          <span className={classes.disabledText}>
            <strong>
              {data.finishedAt !== ''
                ? (
                    (parseInt(data.finishedAt, 10) -
                      parseInt(data.startedAt, 10)) /
                    60
                  ).toFixed(1)
                : (
                    (new Date().getTime() / 1000 -
                      parseInt(data.startedAt, 10)) /
                    60
                  ).toFixed(1)}{' '}
              minutes
            </strong>
          </span>
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <Typography>
          <span className={classes.disabledText}>
            <strong>{timeDifference(data.startedAt)}</strong>
          </span>
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <Button style={{ textTransform: 'none' }}>
          <div className={classes.applicationDetails}>
            <Typography>
              <span className={classes.disabledText}>
                <strong>
                  {t('workflowDetailsView.tableView.showProperties')}
                </strong>
              </span>
            </Typography>
            <KeyboardArrowDownIcon className={classes.arrowMargin} />
          </div>
        </Button>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <Button onClick={() => handleClose()} style={{ textTransform: 'none' }}>
          <div className={classes.applicationDetails}>
            <img src="/icons/eye.svg" alt="eye" />
            <Typography>
              <span className={classes.viewLogs}>
                <strong>{t('workflowDetailsView.tableView.viewLogs')}</strong>
              </span>
            </Typography>
          </div>
        </Button>
      </StyledTableCell>
    </>
  );
};
export default TableData;
