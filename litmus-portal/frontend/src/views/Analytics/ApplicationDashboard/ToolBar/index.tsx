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
import DateRangeSelector from '../../../../components/DateRangeSelector';
import { RangeType } from '../../../../models/dashboardsData';
import refreshData from '../../../../pages/ApplicationDashboard/refreshData';
import useStyles, { useOutlinedInputStyles } from './styles';

interface RefreshObjectType {
  label: string;
  value: number;
}

interface ToolBarProps {
  refreshInterval: number;
  handleRangeChange: (range: RangeType) => void;
  handleRefreshRateChange: (refreshRate: number) => void;
  handleForceUpdate: () => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  refreshInterval,
  handleRangeChange,
  handleRefreshRateChange,
  handleForceUpdate,
}) => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { t } = useTranslation();
  const dateRangeSelectorRef = React.useRef<HTMLDivElement>(null);
  const [isDateRangeSelectorPopoverOpen, setDateRangeSelectorPopoverOpen] =
    React.useState(false);
  const [range, setRange] = React.useState<RangeType>({
    startDate: '',
    endDate: '',
  });
  const [refreshRate, setRefreshRate] = React.useState<number>(refreshInterval);
  const [openRefresh, setOpenRefresh] = React.useState(false);
  const handleCloseRefresh = () => setOpenRefresh(false);
  const handleOpenRefresh = () => setOpenRefresh(true);

  const CallbackFromRangeSelector = (
    selectedStartDate: string,
    selectedEndDate: string
  ) => {
    const startDateFormatted: string = `${
      new Date(moment(selectedStartDate).format()).getTime() / 1000
    }`;
    const endDateFormatted: string = `${
      new Date(
        moment(selectedEndDate)
          .add(23, 'hours')
          .add(59, 'minutes')
          .add(59, 'seconds')
          .format()
      ).getTime() / 1000
    }`;
    setRange({ startDate: startDateFormatted, endDate: endDateFormatted });
    handleRangeChange({
      startDate: startDateFormatted,
      endDate: endDateFormatted,
    });
  };

  const refreshRateChangeHandler = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setRefreshRate(event.target.value as number);
    handleRefreshRateChange(event.target.value as number);
  };

  return (
    <div className={classes.headerDiv}>
      <Typography className={classes.headerInfoText}>
        {t('analyticsDashboard.monitoringDashboardPage.headerInfoText')}
      </Typography>
      <div className={classes.controls}>
        <div ref={dateRangeSelectorRef}>
          <ButtonOutlined
            className={`${classes.selectDate} ${
              isDateRangeSelectorPopoverOpen ? classes.selectDateFocused : ''
            }`}
            onClick={() => setDateRangeSelectorPopoverOpen(true)}
            aria-label="time range"
            aria-haspopup="true"
          >
            <Typography className={classes.displayDate}>
              <IconButton className={classes.rangeSelectorClockIcon}>
                <WatchLaterRoundedIcon />
              </IconButton>
              {range.startDate === ''
                ? `${t(
                    'analyticsDashboard.monitoringDashboardPage.rangeSelector.last30Mins'
                  )}`
                : `${moment
                    .unix(Number(range.startDate))
                    .format('YYYY-MM-DD HH:mm:SS')} 
                    ${t(
                      'analyticsDashboard.monitoringDashboardPage.rangeSelector.to'
                    )} 
                   ${moment
                     .unix(Number(range.endDate))
                     .format('YYYY-MM-DD HH:mm:SS')}`}
              <IconButton className={classes.rangeSelectorIcon}>
                <KeyboardArrowDownIcon />
              </IconButton>
            </Typography>
          </ButtonOutlined>
        </div>
        <DateRangeSelector
          anchorEl={dateRangeSelectorRef.current}
          isOpen={isDateRangeSelectorPopoverOpen}
          onClose={() => setDateRangeSelectorPopoverOpen(false)}
          callbackToSetRange={CallbackFromRangeSelector}
          className={classes.rangeSelectorPopover}
        />

        <div className={classes.refreshDiv}>
          <ButtonOutlined
            onClick={() => handleForceUpdate()}
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
              onClose={handleCloseRefresh}
              onOpen={handleOpenRefresh}
              native={false}
              displayEmpty
              value={refreshRate}
              onChange={refreshRateChangeHandler}
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
                classes: { paper: classes.menuList },
              }}
            >
              {refreshData.map((data: RefreshObjectType) => (
                <MenuItem
                  key={`${data.label}-refresh-option`}
                  value={data.value}
                  className={classes.menuListItem}
                >
                  {t(data.label)}
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
