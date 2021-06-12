import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckBox } from '../../../../components/CheckBox';
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
}

const InfoDropdown: React.FC<InfoDropdownProps> = ({
  dashboardConfigurationDetails,
  metricsToBeShown,
  applicationsToBeShown,
  postPanelSelectionRoutine,
  postApplicationSelectionRoutine,
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
              {dashboardConfigurationDetails.name}
            </Typography>
          </div>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData2'
              )}
            </Typography>
            <div className={classes.iconWithTextDiv}>
              <img
                src={`/icons/${dashboardConfigurationDetails.typeID}_dashboard.svg`}
                alt="dashboard Icon"
                className={classes.inlineIcon}
              />
              <Typography className={classes.infoValue}>
                {dashboardConfigurationDetails.typeID}
              </Typography>
            </div>
          </div>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData3'
              )}
            </Typography>
            <div className={classes.iconWithTextDiv}>
              <img
                src="/icons/prometheus.svg"
                alt="data source Icon"
                className={classes.inlineIcon}
              />
              <Typography className={classes.infoValue}>
                {dashboardConfigurationDetails.dataSourceName}
              </Typography>
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
            </div>
          </div>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData4'
              )}
            </Typography>
            <Typography className={classes.infoValue}>
              {dashboardConfigurationDetails.agentName}
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
            <FormGroup key="application-group">
              {applicationsToBeShown.map((application: string) => (
                <FormControlLabel
                  control={
                    <CheckBox
                      checked={selectedApplications.includes(application)}
                      onChange={() => handleApplicationSelect(application)}
                      name={application}
                    />
                  }
                  label={
                    <Typography className={classes.formControlLabel}>
                      {application}
                    </Typography>
                  }
                  key={`${application}-application-label`}
                />
              ))}
            </FormGroup>
          </div>
        </div>
        <div className={classes.infoSectionElement}>
          <Typography className={classes.sectionHeader}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.infoDropdown.subHeading3'
            )}
          </Typography>
          <div className={classes.checkBoxesContainer}>
            <FormGroup key="metric-group">
              {metricsToBeShown.map((metric: PanelNameAndID) => (
                <FormControlLabel
                  control={
                    <CheckBox
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => handleMetricSelect(metric.id)}
                      name={metric.name}
                    />
                  }
                  label={
                    <Typography className={classes.formControlLabel}>
                      {metric.name}
                    </Typography>
                  }
                  key={`${metric}-metric-label`}
                />
              ))}
            </FormGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoDropdown;
