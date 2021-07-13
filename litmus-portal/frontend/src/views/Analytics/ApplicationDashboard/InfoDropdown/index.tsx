import { FormControlLabel, Typography } from '@material-ui/core';
import { TextButton } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckBox } from '../../../../components/CheckBox';
import {
  DashboardConfigurationDetails,
  PanelNameAndID,
} from '../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  Resource,
} from '../../../../models/graphql/dashboardsDetails';
import { ReactComponent as ExternalLinkIcon } from '../../../../svg/externalLink.svg';
import { ReactComponent as PrometheusIcon } from '../../../../svg/prometheus.svg';
import useStyles, { FormGroupApplicationsGrid, FormGroupGrid } from './styles';

interface InfoDropdownProps {
  dashboardConfigurationDetails: DashboardConfigurationDetails;
  metricsToBeShown: PanelNameAndID[];
  applicationsToBeShown: ApplicationMetadata[];
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
  >([]);

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
                src={`./icons/${dashboardConfigurationDetails.typeID}_dashboard.svg`}
                alt="dashboard Icon"
                className={classes.inlineIcon}
              />
              <Typography className={classes.infoValue}>
                {dashboardConfigurationDetails.typeName}
              </Typography>
            </div>
          </div>
          <div className={classes.dashboardMetaDataItem}>
            <Typography className={classes.infoKey}>
              {t(
                'analyticsDashboard.monitoringDashboardPage.infoDropdown.metaData3'
              )}
            </Typography>
            <TextButton
              className={classes.button}
              onClick={() =>
                window.open(dashboardConfigurationDetails.dataSourceURL)
              }
              startIcon={<PrometheusIcon className={classes.inlineIcon} />}
              endIcon={<ExternalLinkIcon className={classes.inlineIcon} />}
              classes={{ label: classes.buttonLabel }}
            >
              <Typography className={classes.infoValue}>
                {dashboardConfigurationDetails.dataSourceName}
              </Typography>
            </TextButton>
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
          <FormGroupApplicationsGrid key="application-group">
            {applicationsToBeShown?.map(
              (applicationMetadata: ApplicationMetadata) => (
                <div key={`${applicationMetadata.namespace}-namespace`}>
                  <div className={classes.namespaceBox}>
                    <Typography className={classes.infoKey}>
                      {t(
                        'analyticsDashboard.monitoringDashboardPage.infoDropdown.infoKeyNamespace'
                      )}
                    </Typography>
                    <Typography className={classes.infoValue}>
                      {applicationMetadata.namespace}
                    </Typography>
                  </div>
                  {applicationMetadata.applications.map(
                    (resource: Resource) => (
                      <div key={`${resource.kind}-resource`}>
                        {resource.names.map((name: string) => (
                          <FormControlLabel
                            control={
                              <CheckBox
                                checked={selectedApplications.includes(name)}
                                onChange={() => handleApplicationSelect(name)}
                                name={name}
                              />
                            }
                            label={
                              <Typography className={classes.formControlLabel}>
                                {`${resource.kind} / ${name}`}
                              </Typography>
                            }
                            key={`${resource.kind} / ${name}-application-label`}
                          />
                        ))}
                      </div>
                    )
                  )}
                </div>
              )
            )}
          </FormGroupApplicationsGrid>
        </div>
        <div className={classes.infoSectionElement}>
          <Typography className={classes.sectionHeader}>
            {t(
              'analyticsDashboard.monitoringDashboardPage.infoDropdown.subHeading3'
            )}
          </Typography>
          <FormGroupGrid key="metric-group">
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
          </FormGroupGrid>
        </div>
      </div>
    </div>
  );
};

export default InfoDropdown;
