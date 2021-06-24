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
import { ButtonFilled, Search } from 'litmus-ui';
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
  (dataSourceType: string): void;
}

interface StatusCallBackType {
  (status: string): void;
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
  statuses: string[];
  callbackToSetDataSourceType: DataSourceTypeCallBackType;
  callbackToSetRange: RangeCallBackType;
  callbackToSetStatus: StatusCallBackType;
}

interface RangeType {
  startDate: string;
  endDate: string;
}

const TableToolBar: React.FC<TableToolBarProps> = ({
  handleSearch,
  searchToken,
  dataSourceTypes,
  statuses,
  callbackToSetDataSourceType,
  callbackToSetRange,
  callbackToSetStatus,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { t } = useTranslation();
  const [dataSourceType, setDataSourceType] = React.useState<String>('All');
  const [status, setStatus] = React.useState<String>('All');
  const dateRangeSelectorRef = useRef<HTMLButtonElement>(null);
  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });
  const [isDateRangeSelectorPopoverOpen, setDateRangeSelectorPopoverOpen] =
    useState(false);

  const handleDataSourceTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setDataSourceType(event.target.value as String);
    callbackToSetDataSourceType(event.target.value as string);
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as String);
    callbackToSetStatus(event.target.value as string);
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
          placeholder="Search"
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
          className={`${classes.formControl} ${classes.dataSourceStatusForm}`}
        >
          <InputLabel className={classes.selectText}>Status</InputLabel>
          <Select
            label="Status"
            value={status}
            onChange={handleStatusChange}
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
              All
            </MenuItem>
            {statuses.map((availableStatus: string) => (
              <MenuItem
                key={`${availableStatus}-analyticsDashboard-dataSource-toolbar`}
                value={availableStatus}
                className={classes.menuListItem}
              >
                {availableStatus}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          className={`${classes.formControl} ${classes.dataSourceNameForm}`}
        >
          <InputLabel className={classes.selectText}>
            Data source type
          </InputLabel>
          <Select
            label="Data source type"
            value={dataSourceType}
            onChange={handleDataSourceTypeChange}
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
              All
            </MenuItem>
            {dataSourceTypes.map((availableDataSourceType: string) => (
              <MenuItem
                key={`${availableDataSourceType}-analyticsDashboard-dataSource-tableToolbar`}
                value={availableDataSourceType}
                className={classes.menuListItem}
              >
                {availableDataSourceType}
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
              ? 'Select period'
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
        <ButtonFilled
          onClick={() => {
            history.push({
              pathname: '/analytics/datasource/create',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
          className={classes.addButton}
        >
          <Typography className={classes.buttonText}>
            {t('analyticsDashboard.dataSourceTable.addDataSource')}
          </Typography>
        </ButtonFilled>
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
