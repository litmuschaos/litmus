import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckBox from '../../../../components/CheckBox';
import {
  DashboardConfigurationDetails,
  PanelNameAndID,
} from '../../../../models/dashboardsData';
import useStyles from './styles';

interface InfoDropdownProps {
  dashboardConfigurationDetails: DashboardConfigurationDetails;
  metricsToBeShown: PanelNameAndID[];
  applicationsToBeShown: string[];
  postPanelSelectionRoutine: (selectedPanelList: string[]) => void;
  postApplicationSelectionRoutine: (selectedApplicationList: string[]) => void;
  closeInfo: () => void;
}

const InfoDropdown: React.FC<InfoDropdownProps> = ({
  dashboardConfigurationDetails,
  metricsToBeShown,
  applicationsToBeShown,
  postPanelSelectionRoutine,
  postApplicationSelectionRoutine,
  closeInfo,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [selectedApplications, setSelectedApplications] = React.useState<
    string[]
  >(applicationsToBeShown);

  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>(
    metricsToBeShown.map((metric) => metric.id)
  );

  const handleApplicationSelect = (selectedApplication: string) => {
    const newSelectedApps = selectedApplications?.includes(selectedApplication)
      ? selectedApplications?.filter((name) => name !== selectedApplication)
      : [...(selectedApplications ?? []), selectedApplication];
    setSelectedApplications(newSelectedApps);
    postApplicationSelectionRoutine(newSelectedApps);
  };

  const handleMetricSelect = (selectedMetric: string) => {
    const newSelectedMetrics = selectedMetrics?.includes(selectedMetric)
      ? selectedMetrics?.filter((id) => id !== selectedMetric)
      : [...(selectedMetrics ?? []), selectedMetric];
    setSelectedMetrics(newSelectedMetrics);
    postPanelSelectionRoutine(newSelectedMetrics);
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography className={classes.headerText}>
          {t('analyticsDashboard.monitoringDashboardPage.infoDropdown.header')}
        </Typography>
        <ButtonFilled
          className={classes.button}
          onClick={() => {
            closeInfo();
          }}
        >
          <Typography className={classes.closeText}>
            {t('analyticsDashboard.monitoringDashboardPage.infoDropdown.close')}
          </Typography>
          <img
            src="/icons/closeIcon.svg"
            alt="close"
            className={classes.closeIcon}
          />
        </ButtonFilled>
      </div>
      <div className={classes.body}>
        <div className={classes.infoSectionElement}>
          <Typography className={classes.sectionHeader}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.infoDropdown.subHeading1'
            )}
          </Typography>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData1'
              )}
            </Typography>
            <Typography className={classes.infoValue}>
              {' '}
              {dashboardConfigurationDetails.name}{' '}
            </Typography>
          </div>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData2'
              )}
            </Typography>
            <div>
              <Typography className={classes.infoValue}>
                <img
                  src={`/icons/${
                    dashboardConfigurationDetails.type === 'Kubernetes Platform'
                      ? 'kubernetes-platform'
                      : 'sock-shop'
                  }.svg`}
                  alt="dashboard Icon"
                  className={classes.dashboardIcon}
                />{' '}
                {dashboardConfigurationDetails.type}{' '}
              </Typography>
            </div>
          </div>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData3'
              )}
            </Typography>
            <Typography className={classes.infoValue}>
              {' '}
              {dashboardConfigurationDetails.dataSourceName}{' '}
              <Icon
                onClick={() => {
                  window.open(dashboardConfigurationDetails.dataSourceURL);
                }}
              >
                <img
                  src="/icons/externalLink.svg"
                  alt="external link"
                  className={classes.linkIcon}
                />
              </Icon>
            </Typography>
          </div>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData4'
              )}
            </Typography>
            <Typography className={classes.infoValue}>
              {' '}
              {dashboardConfigurationDetails.agent}{' '}
            </Typography>
          </div>
        </div>
        <div className={classes.infoSectionElement}>
          <Typography className={classes.sectionHeader}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.infoDropdown.subHeading2'
            )}
          </Typography>
          <div className={classes.checkBoxesContainer}>
            {applicationsToBeShown.map((application: string) => (
              <FormGroup key="application-group">
                <FormControlLabel
                  control={
                    <CheckBox
                      checked={selectedApplications.includes(application)}
                      onChange={() => handleApplicationSelect(application)}
                      name={application}
                    />
                  }
                  label={application}
                />
              </FormGroup>
            ))}
          </div>
        </div>
        <div className={classes.infoSectionElement}>
          <Typography className={classes.sectionHeader}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.infoDropdown.subHeading3'
            )}
          </Typography>
          <div className={classes.checkBoxesContainer}>
            {metricsToBeShown.map((metric: PanelNameAndID) => (
              <FormGroup key="application-group">
                <FormControlLabel
                  control={
                    <CheckBox
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => handleMetricSelect(metric.id)}
                      name={metric.name}
                    />
                  }
                  label={metric.name}
                  className={classes.formControlLabel}
                />
              </FormGroup>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoDropdown;
