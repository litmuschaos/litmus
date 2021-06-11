import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';
import { ButtonFilled } from 'litmus-ui';
import React, { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles, { useOutlinedInputStyles } from './styles';

interface DataSourceTypeCallBackType {
  (DataSourceType: string): void;
}

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
  dataSourceTypes: string[];
  dashboardTypes: string[];
  agentNames: string[];
  callbackToSetDataSourceType: DataSourceTypeCallBackType;
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
  dataSourceTypes,
  dashboardTypes,
  agentNames,
  callbackToSetRange,
  callbackToSetDataSourceType,
  callbackToSetDashboardType,
  callbackToSetAgentName,
}) => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const [dataSourceType, setDataSourceType] = React.useState<String>('All');
  const [dashboardType, setDashboardType] = React.useState<String>('All');
  const [agentName, setAgentName] = React.useState<String>('All');
  const dateRangeSelectorRef = useRef<HTMLButtonElement>(null);
  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });
  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = useState(false);

  const handleDataSourceTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setDataSourceType(event.target.value as String);
    callbackToSetDataSourceType(event.target.value as string);
  };

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
      <InputBase
        id="input-with-icon-adornment"
        placeholder="Search"
        className={classes.search}
        value={searchToken}
        onChange={handleSearch}
        classes={{
          input: classes.input,
        }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />

      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.dashboardTypeForm}`}
      >
        <InputLabel className={classes.selectText}> Agent Name </InputLabel>
        <Select
          label="Agent Name"
          value={agentName}
          onChange={handleAgentNameChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
        >
          <MenuItem value="All">All</MenuItem>
          {agentNames.map((agentName: string) => (
            <MenuItem
              key={`${agentName}-kubernetesDashboard-Toolbar`}
              value={agentName}
            >
              {agentName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.dashboardTypeForm}`}
      >
        <InputLabel className={classes.selectText}> Dashboard Type </InputLabel>
        <Select
          label="Dashboard Type"
          value={dashboardType}
          onChange={handleDashboardTypeChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
        >
          <MenuItem value="All">All</MenuItem>
          {dashboardTypes.map((dashboardType: string) => (
            <MenuItem
              key={`${dashboardType}-kubernetesDashboard-toolbar`}
              value={dashboardType}
            >
              {dashboardType}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.dataSourceTypeForm}`}
      >
        <InputLabel className={classes.selectText}>
          {' '}
          Data Source Type{' '}
        </InputLabel>
        <Select
          label="Data Source Type"
          value={dataSourceType}
          onChange={handleDataSourceTypeChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
        >
          <MenuItem value="All">All</MenuItem>
          {dataSourceTypes.map((dataSourceType: string) => (
            <MenuItem
              key={`${dataSourceType}-KubernetesDashboard-TableToolbar`}
              value={dataSourceType}
            >
              {dataSourceType}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        className={classes.selectDate}
        onClick={() => setDateRangeSelectorPopoverOpen(true)}
        ref={dateRangeSelectorRef}
        aria-label="time range"
        aria-haspopup="true"
      >
        <Typography className={classes.displayDate}>
          {range.startDate === ' '
            ? 'Select Period'
            : `${range.startDate.split(' ')[2]} ${
                range.startDate.split(' ')[1]
              } ${range.startDate.split(' ')[3]} - ${
                range.endDate.split(' ')[2]
              } ${range.endDate.split(' ')[1]} ${range.endDate.split(' ')[3]}`}

          <IconButton className={classes.rangeSelectorIcon}>
            {isDateRangeSelectorPopoverOpen ? (
              <KeyboardArrowDownIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </Typography>
      </Button>

      <div className={classes.addButton}>
        <ButtonFilled
          onClick={() => {
            history.push({
              pathname: '/analytics/dashboard/create',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
        >
          <Typography className={classes.dateRangeDefault}>
            {t('analyticsDashboard.dashboardTable.addDashboard')}
          </Typography>
        </ButtonFilled>
      </div>
      <DateRangeSelector
        anchorEl={dateRangeSelectorRef.current as HTMLElement}
        isOpen={isDateRangeSelectorPopoverOpen}
        onClose={() => {
          setDateRangeSelectorPopoverOpen(false);
        }}
        callbackToSetRange={CallbackFromRangeSelector}
      />
    </div>
  );
};

export default TableToolBar;
