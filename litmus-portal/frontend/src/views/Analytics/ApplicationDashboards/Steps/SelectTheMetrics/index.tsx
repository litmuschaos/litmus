import { Typography } from '@material-ui/core';
import React, { forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardDetails } from '../../../../../models/dashboardsData';
import useActions from '../../../../../redux/actions';
import * as AlertActions from '../../../../../redux/actions/alert';
import SelectTheMetricsForm from './Form';
import useStyles from './styles';

interface SelectTheMetricsProps {
  dashboardVars: DashboardDetails;
  handleMetricsUpdate: (dashboardMetrics: DashboardDetails) => void;
  setDisabledNext: (next: boolean) => void;
}

const SelectTheMetrics = forwardRef(
  (
    {
      dashboardVars,
      handleMetricsUpdate,
      setDisabledNext,
    }: SelectTheMetricsProps,
    ref
  ) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const alert = useActions(AlertActions);

    function onNext() {
      return true;
    }

    useImperativeHandle(ref, () => ({
      onNext,
    }));

    return (
      <div>
        <Typography className={classes.heading}>
          {t(
            'analyticsDashboard.applicationDashboards.selectTheMetrics.header'
          )}
        </Typography>
        <Typography className={classes.description}>
          {t(
            'analyticsDashboard.applicationDashboards.selectTheMetrics.description'
          )}
        </Typography>
        <div className={classes.metricsForm}>
          <SelectTheMetricsForm
            dashboardVars={dashboardVars}
            CallbackToSetVars={handleMetricsUpdate}
            setDisabledNext={setDisabledNext}
            generateAlert={() => {
              alert.changeAlertState(true);
            }}
          />
        </div>
      </div>
    );
  }
);

export default SelectTheMetrics;
