import { Button, Popover, Typography } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React from 'react';
import { useTranslation } from 'react-i18next';
import YAML from 'yaml';
import { ExecutionData } from '../../../models/graphql/workflowData';
import timeDifference from '../../../utils/datesModifier';
import WorkflowStatus from '../WorkflowStatus';
import useStyles, { StyledTableCell } from './styles';

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
        <Typography className={classes.primaryText}>{data.name}</Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <WorkflowStatus phase={data.phase} />
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <Typography className={classes.primaryText}>
          {data.finishedAt !== ''
            ? (
                (parseInt(data.finishedAt, 10) - parseInt(data.startedAt, 10)) /
                60
              ).toFixed(1)
            : (
                (new Date().getTime() / 1000 - parseInt(data.startedAt, 10)) /
                60
              ).toFixed(1)}
          &nbsp;
          {t('workflowDetailsView.tableView.minutes')}
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        <Typography className={classes.primaryText}>
          {timeDifference(data.startedAt)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.tableCellWidth}>
        {data.type === 'ChaosEngine' && embeddedYAML ? (
          <div>
            <Button
              disabled={!YAML.parse(embeddedYAML).spec.appinfo}
              onClick={(event) => handlePopOverClick(event)}
              style={{ textTransform: 'none' }}
            >
              <div className={classes.applicationDetails}>
                {isOpen ? (
                  <KeyboardArrowDownIcon className={classes.arrowMargin} />
                ) : (
                  <ChevronRightIcon className={classes.arrowMargin} />
                )}
                <Typography>
                  {t('workflowDetailsView.tableView.showProperties')}
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
                {YAML.parse(embeddedYAML).spec.appinfo &&
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
        {data.type === 'ChaosEngine' && (
          <Button
            onClick={() => {
              handleClose();
              onViewLogsClick();
            }}
            style={{ textTransform: 'none' }}
          >
            <div className={classes.applicationDetails}>
              <img src="./icons/eye.svg" alt="eye" />
              <Typography>
                <span className={classes.viewLogs}>
                  <strong>{t('workflowDetailsView.tableView.viewLogs')}</strong>
                </span>
              </Typography>
            </div>
          </Button>
        )}
      </StyledTableCell>
    </>
  );
};
export default TableData;
