/* eslint-disable no-unused-expressions */
import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CheckBox } from '../../../../../../components/CheckBox';
import {
  DashboardDetails,
  PanelGroupMap,
} from '../../../../../../models/dashboardsData';
import { RootState } from '../../../../../../redux/reducers';
import useStyles from './styles';

interface SelectTheMetricsFormProps {
  dashboardVars: DashboardDetails;
  CallbackToSetVars: (vars: DashboardDetails) => void;
  setDisabledNext: (next: boolean) => void;
  generateAlert: () => void;
}

const SelectTheMetricsForm: React.FC<SelectTheMetricsFormProps> = ({
  dashboardVars,
  CallbackToSetVars,
  setDisabledNext,
  generateAlert,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );

  const [dashboardDetails, setDashboardDetails] = useState<DashboardDetails>({
    selectedPanelGroupMap:
      dashboardVars.selectedPanelGroupMap &&
      dashboardVars.selectedPanelGroupMap.length
        ? dashboardVars.selectedPanelGroupMap
        : selectedDashboard.dashboardJSON &&
          selectedDashboard.dashboardJSON.panelGroupMap
        ? selectedDashboard.dashboardJSON.panelGroupMap.map(
            (panelGroup: PanelGroupMap) => ({
              groupName: panelGroup.groupName,
              panels: [],
            })
          )
        : [],
  });

  const [update, setUpdate] = useState(false);

  const handleMetricSelect = (panel: string, index: number) => {
    const selectedPanelGroupMapArray: PanelGroupMap[] =
      dashboardDetails.selectedPanelGroupMap ?? [];
    if (selectedPanelGroupMapArray[index].panels.includes(panel)) {
      selectedPanelGroupMapArray[index].panels = selectedPanelGroupMapArray[
        index
      ].panels.filter((selectedPanel: string) => selectedPanel !== panel);
    } else {
      selectedPanelGroupMapArray[index].panels.push(panel);
    }
    setDashboardDetails({ selectedPanelGroupMap: selectedPanelGroupMapArray });
    setUpdate(true);
  };

  useEffect(() => {
    let selectedNumberOfMetrics = 0;
    dashboardDetails.selectedPanelGroupMap?.forEach((panelGroup) => {
      selectedNumberOfMetrics += panelGroup.panels.length;
    });
    if (
      !dashboardDetails.selectedPanelGroupMap?.length ||
      !selectedNumberOfMetrics
    ) {
      setDisabledNext(true);
    } else {
      setDisabledNext(false);
    }
    if (update === true) {
      CallbackToSetVars(dashboardDetails);
      setUpdate(false);
    }
  }, [update]);

  useEffect(() => {
    if (dashboardDetails.selectedPanelGroupMap?.length === 0) {
      generateAlert();
    }
  }, [dashboardDetails.selectedPanelGroupMap]);

  return (
    <div className={classes.root}>
      {selectedDashboard.dashboardJSON &&
      selectedDashboard.dashboardJSON.panelGroupMap ? (
        selectedDashboard.dashboardJSON.panelGroupMap.map(
          (panelGroup: PanelGroupMap, index: number) => (
            <div
              key={`${panelGroup.groupName}-applicationDashboard-form`}
              className={classes.panelGroupMap}
            >
              <Typography
                align="left"
                display="inline"
                className={classes.panelGroupName}
              >
                {panelGroup.groupName}
              </Typography>
              <FormGroup
                key={`metrics-group-${panelGroup.groupName}`}
                className={classes.formGroup}
              >
                {panelGroup.panels.map((panel: string) => (
                  <FormControlLabel
                    control={
                      <CheckBox
                        checked={
                          dashboardDetails.selectedPanelGroupMap
                            ? dashboardDetails.selectedPanelGroupMap[
                                index
                              ].panels.includes(panel)
                            : false
                        }
                        onChange={() => handleMetricSelect(panel, index)}
                        name={panel}
                      />
                    }
                    label={
                      <Typography className={classes.formControlLabel}>
                        {panel}
                      </Typography>
                    }
                    key={`metrics-group-${panelGroup.groupName}-label`}
                  />
                ))}
              </FormGroup>
            </div>
          )
        )
      ) : (
        <Typography
          align="left"
          display="inline"
          className={classes.panelGroupName}
        >
          {t(
            'analyticsDashboard.applicationDashboards.selectTheMetrics.errorMessage'
          )}
        </Typography>
      )}
    </div>
  );
};

export default SelectTheMetricsForm;
