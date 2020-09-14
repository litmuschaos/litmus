/* eslint-disable react/no-array-index-key */
import { Popover } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface WorkflowAnalyticsProps {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  workflowID: string;
}

function WorkflowAnalytics(props: WorkflowAnalyticsProps) {
  const { anchorEl, isOpen, onClose, workflowID } = props;

  const classes = useStyles();

  const id = isOpen ? 'profile-popover' : undefined;

  return (
    <div>
      <Popover
        id={id}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={onClose}
        elevation={1}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.popoverAnalytics,
        }}
        className={classes.popoverAnalyticsAdjust}
      >
        <div className={classes.analyticsContainer}>{workflowID}</div>
      </Popover>
    </div>
  );
}

export default WorkflowAnalytics;
