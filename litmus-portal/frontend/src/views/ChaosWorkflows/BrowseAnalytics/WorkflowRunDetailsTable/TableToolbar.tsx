import {
  Typography,
  InputBase,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  IconButton,
} from '@material-ui/core';
import React, { ChangeEvent, useRef, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import useStyles from './styles';
import DateRangeSelector from '../../../../components/DateRangeSelector';

interface TestCallBackType {
  (clusterName: string): void;
}

interface TestResultCallBackType {
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
  tests: string[];
  testResults: string[];
  callbackToSetTest: TestCallBackType;
  callbackToSetRange: RangeCallBackType;
  callbackToSetResult: TestResultCallBackType;
}

interface RangeType {
  startDate: string;
  endDate: string;
}

const TableToolBar: React.FC<TableToolBarProps> = ({
  handleSearch,
  searchToken,
  tests,
  testResults,
  callbackToSetTest,
  callbackToSetRange,
  callbackToSetResult,
}) => {
  const classes = useStyles();
  const [test, setTest] = React.useState<String>('All');
  const [testResult, setTestResult] = React.useState<String>('All');
  const dateRangeSelectorRef = useRef<HTMLButtonElement>(null);
  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });
  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = useState(false);

  const handleTestChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTest(event.target.value as String);
    callbackToSetTest(event.target.value as string);
  };

  const handleTestResultChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setTestResult(event.target.value as String);
    callbackToSetResult(event.target.value as string);
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
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />

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

      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.testResultForm}`}
        color="secondary"
        focused
      >
        <InputLabel className={classes.selectText}> Test Result </InputLabel>
        <Select
          label="Test Result"
          value={testResult}
          onChange={handleTestResultChange}
          className={classes.selectText}
          color="secondary"
        >
          <MenuItem value="All">All</MenuItem>
          {testResults.map((testResult: string) => (
            <MenuItem value={testResult}>{testResult}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.testForm}`}
        color="secondary"
        focused
      >
        <InputLabel className={classes.selectText}> Test Name </InputLabel>
        <Select
          label="Test Name"
          value={test}
          onChange={handleTestChange}
          className={classes.selectText}
          color="secondary"
        >
          <MenuItem value="All">All</MenuItem>
          {tests.map((testName: string) => (
            <MenuItem value={testName}>{testName}</MenuItem>
          ))}
        </Select>
      </FormControl>

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
