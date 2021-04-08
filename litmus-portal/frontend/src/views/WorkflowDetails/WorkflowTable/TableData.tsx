import { Button, Popover, Typography } from '@material-ui/core';
import React from 'react';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useTranslation } from 'react-i18next';
import YAML from 'yaml';
import timeDifference from '../../../utils/datesModifier';
import useStyles, { StyledTableCell } from './styles';
import { ExecutionData } from '../../../models/graphql/workflowData';
import WorkflowStatus from '../WorkflowStatus';

interface TableDataProps {
  onViewLogsClick: () => void;
  embeddedYAML: string;
  data: ExecutionData['nodes'][0];
  handleClose: () => void;
}

const TableData: React.FC<TableDataProps> = ({
  data,
  handleClose,
  embeddedYAML,
  onViewLogsClick,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const isOpen = Boolean(popAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };
  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };

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
        <WorkflowStatus phase={data.phase} />
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
        {data.type === 'ChaosEngine' ? (
          <div>
            <Button
              onClick={handlePopOverClick}
              style={{ textTransform: 'none' }}
            >
              <div className={classes.applicationDetails}>
                {isOpen ? (
                  <KeyboardArrowDownIcon className={classes.arrowMargin} />
                ) : (
                  <ChevronRightIcon className={classes.arrowMargin} />
                )}
                <Typography>
                  <span className={classes.disabledText}>
                    <strong>
                      {t('workflowDetailsView.tableView.showProperties')}
                    </strong>
                  </span>
                </Typography>
              </div>
            </Button>
            <Popover
              id={id}
              open={isOpen}
              anchorEl={popAnchorEl}
              onClose={handlePopOverClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <div className={classes.popover}>
                {YAML.parse(embeddedYAML) &&
                  Object.keys(YAML.parse(embeddedYAML).spec.appinfo).map(
                    (key, index) => {
                      return (
                        <Typography
                          key={index.toString()}
                          className={classes.popoverItems}
                        >
                          <span className={classes.boldText}>{key} :</span>
                          &nbsp;
                          {YAML.parse(embeddedYAML).spec.appinfo[key]}
                        </Typography>
                      );
                    }
                  )}
              </div>
            </Popover>
          </div>
        ) : null}
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <Button
          onClick={() => {
            handleClose();
            onViewLogsClick();
          }}
          style={{ textTransform: 'none' }}
        >
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
