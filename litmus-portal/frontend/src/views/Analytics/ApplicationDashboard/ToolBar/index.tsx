import {
  FormControl,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import WatchLaterRoundedIcon from '@material-ui/icons/WatchLaterRounded';
import { ButtonOutlined } from 'litmus-ui';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import {
  DEFAULT_REFRESH_RATE,
  DEFAULT_TOLERANCE_LIMIT,
  MAX_REFRESH_RATE,
  MINIMUM_TOLERANCE_LIMIT,
} from '../../../../pages/ApplicationDashboard/constants';
import refreshData from '../../../../pages/ApplicationDashboard/refreshData';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { RootState } from '../../../../redux/reducers';
import useStyles, { useOutlinedInputStyles } from './styles';

interface RefreshObjectType {
  label: string;
  value: number;
}

const ToolBar: React.FC = () => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { t } = useTranslation();
  const dashboard = useActions(DashboardActions);
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );

  const dateRangeSelectorRef = React.useRef<HTMLDivElement>(null);
  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = React.useState(false);
  const [refreshRate, setRefreshRate] = React.useState<number>(
    selectedDashboard.refreshRate ? selectedDashboard.refreshRate : 0
  );
  const [openRefresh, setOpenRefresh] = React.useState(false);
  const handleCloseRefresh = () => {
    setOpenRefresh(false);
  };

  const handleOpenRefresh = () => {
    setOpenRefresh(true);
  };

  const clearTimeOuts = async () => {
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
      window.clearTimeout(id);
    }

    return Promise.resolve(id === 0);
  };

  const CallbackFromRangeSelector = (
    selectedStartDate: string,
    selectedEndDate: string
  ) => {
    const startDateFormatted: string = moment(selectedStartDate).format();
    const endDateFormatted: string = moment(selectedEndDate)
      .add(23, 'hours')
      .add(59, 'minutes')
      .add(59, 'seconds')
      .format();
    dashboard.selectDashboard({
      range: { startDate: startDateFormatted, endDate: endDateFormatted },
    });
    const endDate: number =
      new Date(moment(endDateFormatted).format()).getTime() / 1000;
    const now: number = Math.round(new Date().getTime() / 1000);
    const diff: number = Math.abs(now - endDate);
    const maxLim: number =
      (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 !== 0
        ? (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 +
          MINIMUM_TOLERANCE_LIMIT
        : DEFAULT_TOLERANCE_LIMIT;
    if (
      !(diff >= 0 && diff <= maxLim) &&
      selectedDashboard.refreshRate !== MAX_REFRESH_RATE
    ) {
      clearTimeOuts().then(() => {
        setRefreshRate(MAX_REFRESH_RATE);
      });
    }
  };

  const getRefreshRateStatus = () => {
    if (selectedDashboard.range) {
      const endDate: number =
        new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
        1000;
      const now: number = Math.round(new Date().getTime() / 1000);
      const diff: number = Math.abs(now - endDate);
      const maxLim: number =
        (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 !== 0
          ? (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 +
            MINIMUM_TOLERANCE_LIMIT
          : DEFAULT_TOLERANCE_LIMIT;
      if (!(diff >= 0 && diff <= maxLim)) {
        // A non relative time range has been selected.
        // Refresh rate switch is not acknowledged and it's state is locked (Off).
        // Select a relative time range or select a different refresh rate to unlock again.
        return true;
      }
    }
    // For relative time ranges.
    return false;
  };

  return (
    <div className={classes.headerDiv}>
      <Typography className={classes.headerInfoText}>
        {t('analyticsDashboard.monitoringDashboardPage.headerInfoText')}
      </Typography>
      <div className={classes.controls}>
        <div ref={dateRangeSelectorRef}>
          <ButtonOutlined
            className={classes.selectDate}
            onClick={() => setDateRangeSelectorPopoverOpen(true)}
            aria-label="time range"
            aria-haspopup="true"
          >
            <Typography className={classes.displayDate}>
              <IconButton className={classes.rangeSelectorClockIcon}>
                <WatchLaterRoundedIcon />
              </IconButton>
              {!selectedDashboard.range ||
              selectedDashboard.range.startDate === ' '
                ? `${t(
                    'analyticsDashboard.monitoringDashboardPage.rangeSelector.selectPeriod'
                  )}`
                : `${selectedDashboard.range.startDate.split('-')[0]}-${
                    selectedDashboard.range.startDate.split('-')[1]
                  }-${selectedDashboard.range.startDate.substring(
                    selectedDashboard.range.startDate.lastIndexOf('-') + 1,
                    selectedDashboard.range.startDate.lastIndexOf('T')
                  )} 
                    
                  ${selectedDashboard.range.startDate.substring(
                    selectedDashboard.range.startDate.lastIndexOf('T') + 1,
                    selectedDashboard.range.startDate.lastIndexOf('+')
                  )} 
                    ${t(
                      'analyticsDashboard.monitoringDashboardPage.rangeSelector.to'
                    )}
                   ${selectedDashboard.range.endDate.split('-')[0]}-${
                    selectedDashboard.range.endDate.split('-')[1]
                  }-${selectedDashboard.range.endDate.substring(
                    selectedDashboard.range.endDate.lastIndexOf('-') + 1,
                    selectedDashboard.range.endDate.lastIndexOf('T')
                  )} 
                    
                  ${selectedDashboard.range.endDate.substring(
                    selectedDashboard.range.endDate.lastIndexOf('T') + 1,
                    selectedDashboard.range.endDate.lastIndexOf('+')
                  )}`}

              <IconButton className={classes.rangeSelectorIcon}>
                <KeyboardArrowDownIcon />
              </IconButton>
            </Typography>
          </ButtonOutlined>
        </div>
        <DateRangeSelector
          anchorEl={dateRangeSelectorRef.current}
          isOpen={isDateRangeSelectorPopoverOpen}
          onClose={() => {
            setDateRangeSelectorPopoverOpen(false);
          }}
          callbackToSetRange={CallbackFromRangeSelector}
          className={classes.rangeSelectorPopover}
        />

        <div className={classes.refreshDiv}>
          <ButtonOutlined
            onClick={() => {
              clearTimeOuts().then(() => {
                dashboard.selectDashboard({
                  forceUpdate: true,
                });
              });
            }}
            className={classes.refreshButton}
          >
            <img
              src="/icons/refresh-dashboard.svg"
              alt="refresh icon"
              className={classes.refreshIcon}
            />
          </ButtonOutlined>
          <FormControl className={classes.formControl} variant="outlined">
            <Select
              labelId="refresh-controlled-open-select-label"
              id="refresh-controlled-open-select"
              open={openRefresh}
              disabled={getRefreshRateStatus()}
              onClose={handleCloseRefresh}
              onOpen={handleOpenRefresh}
              native={false}
              displayEmpty
              value={refreshRate !== 0 ? refreshRate : null}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                // When viewing data for non-relative time range, refresh should be Off ideally.
                // UI can auto detect if it is not Off and switches it to Off.
                // Now the user can try to view the non-relative time range data again.
                if (selectedDashboard.refreshRate !== MAX_REFRESH_RATE) {
                  dashboard.selectDashboard({
                    refreshRate: event.target.value as number,
                  });
                  setRefreshRate(event.target.value as number);
                } else {
                  dashboard.selectDashboard({
                    refreshRate: event.target.value as number,
                  });
                  setRefreshRate(event.target.value as number);
                  dashboard.selectDashboard({
                    forceUpdate: true,
                  });
                }
              }}
              input={<OutlinedInput classes={outlinedInputClasses} />}
              renderValue={() => (
                <div>
                  {t(
                    'analyticsDashboard.monitoringDashboardPage.refresh.heading'
                  )}
                </div>
              )}
              IconComponent={KeyboardArrowDownIcon}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                getContentAnchorEl: null,
              }}
            >
              <MenuItem
                key="Off-refresh-option"
                value={MAX_REFRESH_RATE}
                className={classes.menuListItem}
              >
                <Typography
                  className={classes.menuListItemText}
                  style={{
                    fontWeight: refreshRate === MAX_REFRESH_RATE ? 500 : 400,
                  }}
                >
                  {t('analyticsDashboard.monitoringDashboardPage.refresh.off')}
                </Typography>
                {refreshRate === MAX_REFRESH_RATE ? (
                  <img
                    src="/icons/check.svg"
                    alt="check mark"
                    className={classes.checkIcon}
                  />
                ) : (
                  <></>
                )}
              </MenuItem>
              {refreshData.map((data: RefreshObjectType) => (
                <MenuItem
                  key={`${data.label}-refresh-option`}
                  value={data.value}
                  className={classes.menuListItem}
                >
                  <Typography
                    className={classes.menuListItemText}
                    style={{
                      fontWeight: refreshRate === data.value ? 500 : 400,
                    }}
                  >
                    {t(data.label)}
                  </Typography>
                  {refreshRate === data.value ? (
                    <img
                      src="/icons/check.svg"
                      alt="check mark"
                      className={classes.checkIcon}
                    />
                  ) : (
                    <></>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
