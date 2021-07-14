import { Typography } from '@material-ui/core';
import { ButtonOutlined, Modal } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardData } from '../../../../../../models/dashboardsData';
import useActions from '../../../../../../redux/actions';
import * as DashboardActions from '../../../../../../redux/actions/dashboards';
import DashboardCard from './index';
import useStyles from './styles';
import UploadJSON from './UploadDashboard';

interface DashboardCardsProps {
  dashboards: DashboardData[];
  handleClick: () => void;
  generateAlert: () => void;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  dashboards,
  handleClick,
  generateAlert,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dashboard = useActions(DashboardActions);

  const [upload, setUpload] = React.useState(false);

  return (
    <div>
      <div className={classes.root}>
        {dashboards &&
          dashboards.map((d: DashboardData) => (
            <div key={d.dashboardTypeID} data-cy="dashboardCard">
              <DashboardCard
                key={d.dashboardTypeID}
                dashboardTypeID={d.dashboardTypeID}
                typeName={d.typeName}
                urlToIcon={d.urlToIcon}
                handleClick={() => {
                  if (
                    d.dashboardTypeID !== 'custom' &&
                    d.dashboardTypeID !== 'upload'
                  ) {
                    dashboard.selectDashboard({
                      dashboardJSON: d.dashboardJSON,
                    });
                    handleClick();
                  } else if (d.dashboardTypeID === 'custom') {
                    dashboard.selectDashboard({
                      dashboardJSON: null,
                    });
                    handleClick();
                  } else if (d.dashboardTypeID === 'upload') {
                    setUpload(true);
                  }
                }}
                information={d.information}
              />
            </div>
          ))}
      </div>

      {upload && (
        <Modal
          open
          onClose={() => setUpload(false)}
          modalActions={
            <ButtonOutlined
              className={classes.closeButton}
              onClick={() => setUpload(false)}
            >
              &#x2715;
            </ButtonOutlined>
          }
          width="50%"
          height="fit-content"
        >
          <div className={classes.modal}>
            <Typography className={classes.modalHeading} align="left">
              {t(
                'analyticsDashboard.applicationDashboards.chooseADashboardType.uploadModal.heading'
              )}
            </Typography>
            <UploadJSON
              successHandler={() => handleClick()}
              errorHandler={() => generateAlert()}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardCards;
