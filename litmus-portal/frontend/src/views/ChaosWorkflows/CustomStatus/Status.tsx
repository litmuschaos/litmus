import { Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUCCEEDED } from '../../WorkflowDetails/workflowConstants';
import useStyles from './styles';

interface StatusProps {
  status: string;
}

const CustomStatus: React.FC<StatusProps> = ({ status }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [label, setLabel] = React.useState(' ');
  useEffect(() => {
    if (status === 'Succeeded') {
      return setLabel(`${classes.status} ${classes.completed}`);
    }
    if (status === 'Running' || status === 'Pending') {
      return setLabel(`${classes.status} ${classes.running}`);
    }
    return setLabel(`${classes.status} ${classes.failed}`);
  }, [status]);

  return (
    <>
      <div className={label}>
        <Typography data-testid="status" className={classes.statusFont}>
          {status === SUCCEEDED
            ? `${t('workflowDetailsView.workflowInfo.Completed')}`
            : status}
        </Typography>
      </div>
    </>
  );
};
export default CustomStatus;
