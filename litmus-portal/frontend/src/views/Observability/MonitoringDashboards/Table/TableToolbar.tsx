import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { Search } from 'litmus-ui';
import React, { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import useStyles, { useOutlinedInputStyles } from './styles';

interface AgentNameCallBackType {
  (AgentName: string): void;
}

interface DashboardTypeCallBackType {
  (testResult: string): void;
}

interface RangeCallBackType {
  (selectedStartDate: string, selectedEndDate: string): void;
}

interface TableToolBarProps {
  searchToken: string;
  handleSearch: (
    event?: ChangeEvent<{ value: unknown }>,
    token?: string
  ) => void;
  dashboardTypes: string[];
  agentNames: string[];
  callbackToSetRange: RangeCallBackType;
  callbackToSetDashboardType: DashboardTypeCallBackType;
  callbackToSetAgentName: AgentNameCallBackType;
}

interface RangeType {
  startDate: string;
  endDate: string;
}

const TableToolBar: React.FC<TableToolBarProps> = ({
  handleSearch,
  searchToken,
  dashboardTypes,
  agentNames,
  callbackToSetRange,
  callbackToSetDashboardType,
  callbackToSetAgentName,
}) => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { t } = useTranslation();
  const [dashboardType, setDashboardType] = React.useState<String>('All');
  const [agentName, setAgentName] = React.useState<String>('All');
  const dateRangeSelectorRef = useRef<HTMLButtonElement>(null);
  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });
  const [isDateRangeSelectorPopoverOpen, setDateRangeSelectorPopoverOpen] =
    useState(false);

  const handleDashboardTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setDashboardType(event.target.value as String);
    callbackToSetDashboardType(event.target.value as string);
  };

  const handleAgentNameChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setAgentName(event.target.value as String);
    callbackToSetAgentName(event.target.value as string);
  };

  const CallbackFromRangeSelector = (
    selectedStartDate: string,
    selectedEndDate: string
  ) => {
    setRange({ startDate: selectedStartDate, endDate: selectedEndDate });
    callbackToSetRange(
      `${`${selectedStartDate.split(' ')[2]} ${
        selectedStartDate.split(' ')[1]
      } ${selectedStartDate.split(' ')[3]}`}`,
      `${`${selectedEndDate.split(' ')[2]} ${selectedEndDate.split(' ')[1]} ${
        selectedEndDate.split(' ')[3]
      }`}`
    );
  };

  return (
    <div className={classes.headerSection}>
      <div className={classes.search}>
        <Search
          id="input-with-icon-textfield"
          placeholder={t('monitoringDashboard.monitoringDashboardTable.search')}
          value={searchToken}
          onChange={handleSearch}
        />
      </div>
      <div
        className={classes.headerSection}
        style={{ justifyContent: 'flex-end' }}
      >
        <FormControl
          variant="outlined"
          className={`${classes.formControl} ${classes.dashboardTypeForm}`}
        >
          <InputLabel className={classes.selectText}>
            {t('monitoringDashboard.monitoringDashboardTable.tableHead2')}
          </InputLabel>
          <Select
            label={t('monitoringDashboard.monitoringDashboardTable.tableHead2')}
            value={agentName}
            onChange={handleAgentNameChange}
            className={classes.selectText}
            input={<OutlinedInput classes={outlinedInputClasses} />}
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
            <MenuItem value="All" className={classes.menuListItem}>
              {t('monitoringDashboard.monitoringDashboardTable.all')}
            </MenuItem>
            {agentNames.map((availableAgentName: string) => (
              <MenuItem
                key={`${availableAgentName}-kubernetesDashboard-Toolbar`}
                value={availableAgentName}
                className={classes.menuListItem}
              >
                {availableAgentName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          className={`${classes.formControl} ${classes.dashboardTypeForm}`}
        >
          <InputLabel className={classes.selectText}>
            {t('monitoringDashboard.monitoringDashboardTable.tableHead3')}
          </InputLabel>
          <Select
            label={t('monitoringDashboard.monitoringDashboardTable.tableHead3')}
            value={dashboardType}
            onChange={handleDashboardTypeChange}
            className={classes.selectText}
            input={<OutlinedInput classes={outlinedInputClasses} />}
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
            <MenuItem value="All" className={classes.menuListItem}>
              {t('monitoringDashboard.monitoringDashboardTable.all')}
            </MenuItem>
            {dashboardTypes.map((availableDashboardType: string) => (
              <MenuItem
                key={`${availableDashboardType}-kubernetesDashboard-toolbar`}
                value={availableDashboardType}
                className={classes.menuListItem}
              >
                {availableDashboardType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          className={`${classes.selectDate} ${
            isDateRangeSelectorPopoverOpen ? classes.selectDateFocused : ''
          }`}
          onClick={() => setDateRangeSelectorPopoverOpen(true)}
          ref={dateRangeSelectorRef}
          aria-label="time range"
          aria-haspopup="true"
        >
          <Typography className={classes.displayDate}>
            {range.startDate === ' '
              ? t('monitoringDashboard.monitoringDashboardTable.selectPeriod')
              : `${range.startDate.split(' ')[2]} ${
                  range.startDate.split(' ')[1]
                } ${range.startDate.split(' ')[3]} - ${
                  range.endDate.split(' ')[2]
                } ${range.endDate.split(' ')[1]} ${
                  range.endDate.split(' ')[3]
                }`}

            <IconButton className={classes.rangeSelectorIcon}>
              {isDateRangeSelectorPopoverOpen ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          </Typography>
        </Button>
        <DateRangeSelector
          anchorEl={dateRangeSelectorRef.current as HTMLElement}
          isOpen={isDateRangeSelectorPopoverOpen}
          onClose={() => {
            setDateRangeSelectorPopoverOpen(false);
          }}
          callbackToSetRange={CallbackFromRangeSelector}
        />
      </div>
    </div>
  );
};

export default TableToolBar;
