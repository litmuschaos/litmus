import { Typography } from '@material-ui/core';
import React, { forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardList from '../../../../../components/PreconfiguredDashboards/data';
import useActions from '../../../../../redux/actions';
import * as AlertActions from '../../../../../redux/actions/alert';
import { getProjectRole } from '../../../../../utils/getSearchParams';
import DashboardCards from './Cards/DashBoardCards';
import useStyles from './styles';

interface ChooseADashboardTypeProps {
  handleNext: () => void;
}

const ChooseADashboardType = forwardRef(
  ({ handleNext }: ChooseADashboardTypeProps, ref) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const alert = useActions(AlertActions);

    function onNext() {
      if (getProjectRole() === 'Viewer') {
        alert.changeAlertState(true);
        return false;
      }
      return true;
    }

    useImperativeHandle(ref, () => ({
      onNext,
    }));

    return (
      <div>
        <Typography className={classes.heading}>
          {t(
            'analyticsDashboard.applicationDashboards.chooseADashboardType.header'
          )}
        </Typography>
        <Typography className={classes.description}>
          {t(
            'analyticsDashboard.applicationDashboards.chooseADashboardType.description'
          )}
        </Typography>
        <div className={classes.cards}>
          <DashboardCards
            dashboards={DashboardList}
            handleClick={handleNext}
            generateAlert={() => {
              alert.changeAlertState(true);
            }}
          />
        </div>
      </div>
    );
  }
);

export default ChooseADashboardType;
