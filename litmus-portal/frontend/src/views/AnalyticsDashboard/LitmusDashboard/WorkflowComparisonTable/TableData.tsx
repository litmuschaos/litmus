import { IconButton, Typography } from '@material-ui/core';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import cronstrue from 'cronstrue';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Workflow } from '../../../../models/graphql/workflowListData';
import { history } from '../../../../redux/configureStore';
import useStyles, { StyledCheckbox, StyledTableCell } from './styles';

interface TableDataProps {
  data: Workflow;
  itemSelectionStatus: boolean;
  labelIdentifier: string;
  comparisonState: Boolean;
}

const TableData: React.FC<TableDataProps> = ({
  data,
  itemSelectionStatus,
  labelIdentifier,
  comparisonState,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY');
    return resDate;
  };

  return (
    <>
      <StyledTableCell padding="checkbox" className={classes.checkbox}>
        {comparisonState === false ? (
          <StyledCheckbox
            checked={itemSelectionStatus}
            inputProps={{ 'aria-labelledby': labelIdentifier }}
          />
        ) : (
          <div />
        )}
      </StyledTableCell>
      <StyledTableCell className={classes.workflowName}>
        <Typography>
          <strong>{data.workflow_name}</strong>
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography className={classes.tableObjects}>
          {formatDate(data.created_at)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <div className={classes.regularityData}>
          <div className={classes.iconDiv}>
            <img src="./icons/calendarIcon.svg" alt="Calender" />
            <Typography className={classes.paddedText}>
              {data.cronSyntax === ''
                ? t(
                    'chaosWorkflows.browseAnalytics.workFlowComparisonTable.once'
                  )
                : cronstrue.toString(data.cronSyntax)}
            </Typography>
          </div>
        </div>
      </StyledTableCell>
      <StyledTableCell>
        <Typography className={classes.tableObjects}>
          &nbsp;{data.cluster_name}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography className={classes.tableObjects}>
          <strong>
            {t(
              'chaosWorkflows.browseAnalytics.workFlowComparisonTable.seeAnalytics'
            )}
          </strong>
          <IconButton
            edge="end"
            aria-label="analytics for workflow id"
            aria-haspopup="true"
            onClick={() =>
              history.push(`/workflows/analytics/${data.workflow_id}`)
            }
            className={classes.buttonSeeAnalytics}
          >
            <ExpandMoreTwoToneIcon htmlColor="black" />
          </IconButton>
        </Typography>
      </StyledTableCell>
    </>
  );
};
export default TableData;
