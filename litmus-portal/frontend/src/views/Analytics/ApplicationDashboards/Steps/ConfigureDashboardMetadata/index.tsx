import { Typography } from '@material-ui/core';
import React, { forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardDetails } from '../../../../../models/dashboardsData';
import { ListDataSourceResponse } from '../../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../../redux/actions';
import * as AlertActions from '../../../../../redux/actions/alert';
import { getProjectRole } from '../../../../../utils/getSearchParams';
import DashboardMetadataForm from './Form';
import useStyles from './styles';

interface ConfigureDashboardMetadataProps {
  dashboardVars: DashboardDetails;
  dataSourceList: ListDataSourceResponse[];
  handleMetadataUpdate: (dashboardMetadata: DashboardDetails) => void;
  configure: boolean;
  setDisabledNext: (next: boolean) => void;
}

const ConfigureDashboardMetadata = forwardRef(
  (
    {
      dashboardVars,
      dataSourceList,
      handleMetadataUpdate,
      configure,
      setDisabledNext,
    }: ConfigureDashboardMetadataProps,
    ref
  ) => {
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
            'analyticsDashboard.applicationDashboards.configureDashboardMetadata.header'
          )}
        </Typography>
        <Typography className={classes.description}>
          {t(
            'analyticsDashboard.applicationDashboards.configureDashboardMetadata.description'
          )}
        </Typography>
        <div className={classes.metadataForm}>
          <DashboardMetadataForm
            dashboardVars={dashboardVars}
            dataSourceList={dataSourceList}
            configure={configure}
            CallbackToSetVars={handleMetadataUpdate}
            setDisabledNext={setDisabledNext}
          />
        </div>
      </div>
    );
  }
);

export default ConfigureDashboardMetadata;
