import { Paper } from '@material-ui/core';
import * as React from 'react';
import { LocalQuickActionCard } from '../../../../components/LocalQuickActionCard';
import useStyles from './styles';

const QuickActionsCard: React.FC = () => {
  const classes = useStyles();

  return (
    <Paper id="totWorkflows" className={classes.totWorkFlow}>
      <LocalQuickActionCard
        className={classes.quickAction}
        variant="returningHome"
      />
    </Paper>
  );
};

export default QuickActionsCard;
