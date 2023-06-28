import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';
import React, { ChangeEvent, useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import useStyles, { useOutlinedInputStyles } from './styles';

interface TestCallBackType {
  (clusterName: string): void;
}

interface TestResultCallBackType {
  (testResult: string): void;
}

interface HandleContextType {
  (contextName: string): void;
}

interface TableToolBarProps {
  searchToken: string;
  popAnchorEl: HTMLElement | null;
  isOpen: boolean;
  handleSearch: (
    event?: ChangeEvent<{ value: unknown }>,
    token?: string
  ) => void;
  tests: string[];
  testResults: string[];
  context: string[];
  callbackToSetTest: TestCallBackType;
  handleContextFilter: (contextName: string) => void;
  selectDate: (selectFromDate: string, selectToDate: string) => void;
  displayDate: string;
  callbackToSetResult: TestResultCallBackType;
  popOverClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  popOverClose: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
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
  context,
  callbackToSetTest,
  callbackToSetResult,
  handleContextFilter,
  selectDate,
  displayDate,
  popOverClose,
  popOverClick,
  popAnchorEl,
  isOpen,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();

  const outlinedInputClasses = useOutlinedInputStyles();
  const [test, setTest] = React.useState<String>('All');
  const [testResult, setTestResult] = React.useState<String>('All');
  const [contextName, setContextName] = React.useState<String>('All');

  const handleTestChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTest(event.target.value as String);
    callbackToSetTest(event.target.value as string);
  };

  const handleContext = (event: React.ChangeEvent<{ value: unknown }>) => {
    setContextName(event.target.value as String);
    handleContextFilter(event.target.value as string);
  };

  const handleTestResultChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setTestResult(event.target.value as String);
    callbackToSetResult(event.target.value as string);
  };

  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
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

      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.testResultForm}`}
      >
        <InputLabel className={classes.selectText}>
          Experiment verdict
        </InputLabel>
        <Select
          label="Test Result"
          value={testResult}
          onChange={handleTestResultChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
        >
          <MenuItem value="All">All</MenuItem>
          {testResults.map((testResult: string) => (
            <MenuItem
              key={`${testResult}-litmusDashboard-scenarioRunDetails`}
              value={testResult}
            >
              {testResult}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.testResultForm}`}
      >
        <InputLabel className={classes.selectText}>Context</InputLabel>
        <Select
          label="Context"
          value={contextName}
          onChange={handleContext}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
        >
          <MenuItem value="All">All</MenuItem>
          {context.map((contextName: string) => (
            <MenuItem
              key={`${contextName}-litmusDashboard-scenarioRunDetails`}
              value={contextName}
            >
              {contextName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        variant="outlined"
        className={`${classes.formControl} ${classes.testForm}`}
      >
        <InputLabel className={classes.selectText}>Experiment Name</InputLabel>
        <Select
          label="Test Name"
          value={test}
          onChange={handleTestChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
        >
          <MenuItem value="All">All</MenuItem>
          {tests.map((testName: string) => (
            <MenuItem
              key={`${testName}-scenarioRunDetailsTable`}
              value={testName}
            >
              {testName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button className={classes.selectDate} onClick={popOverClick}>
        <Typography className={classes.displayDate}>
          {displayDate}
          <IconButton style={{ width: 10, height: 10 }}>
            {isOpen ? <KeyboardArrowDownIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Typography>
      </Button>
      <Popover
        className={classes.popOver}
        open={isOpen}
        anchorEl={popAnchorEl}
        onClose={popOverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <DateRangePicker
          onChange={(item) => {
            setState([(item as any).selection]);
            selectDate(
              `${(item as any).selection.startDate}`,
              `${(item as any).selection.endDate}`
            );
          }}
          showSelectionPreview
          moveRangeOnFirstSelection={false}
          months={1}
          ranges={state}
          direction="vertical"
          editableDateInputs
          rangeColors={[palette.primary.dark]}
          showMonthAndYearPickers
        />
      </Popover>
    </div>
  );
};

export default TableToolBar;
