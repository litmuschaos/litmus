import {
  Typography,
  InputBase,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
} from '@material-ui/core';
import React, { useRef, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
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
  handleSearch: any;
  tests: any;
  testResults: any;
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

  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });

  const [test, setTest] = React.useState<String>('');

  const [testResult, setTestResult] = React.useState<String>('');

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

  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = useState(false);

  const dateRangeSelectorRef = useRef();

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

  // useEffect(() => {}, [range]);

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
        variant="outlined"
        color="primary"
        className={classes.button}
        endIcon={<ArrowDropDownIcon />}
        ref={dateRangeSelectorRef as any}
        aria-label="time range"
        aria-haspopup="true"
        onClick={() => setDateRangeSelectorPopoverOpen(true)}
      >
        {range.startDate === ' ' ? (
          <Typography className={classes.dateRangeDefault}>
            Select Period
          </Typography>
        ) : (
          <Typography className={classes.dateRange}>
            {`${range.startDate.split(' ')[2]} ${
              range.startDate.split(' ')[1]
            } ${range.startDate.split(' ')[3]} - ${
              range.endDate.split(' ')[2]
            } ${range.endDate.split(' ')[1]} ${range.endDate.split(' ')[3]}`}
          </Typography>
        )}
      </Button>

      <FormControl variant="outlined" className={classes.select1}>
        <InputLabel htmlFor="outlined-selection" className={classes.formLabel}>
          Test Result
        </InputLabel>
        <Select
          label="Target cluster"
          value={testResult}
          onChange={handleTestResultChange}
          inputProps={{
            name: 'name',
            id: 'outlined-selection',
          }}
          className={classes.formSize}
          color="secondary"
          disableUnderline
        >
          <MenuItem value="">
            <Typography className={classes.menuItem}>All</Typography>
          </MenuItem>
          {testResults.map((testResult: any) => (
            <MenuItem value={testResult}>
              <Typography className={classes.menuItem}>{testResult}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" className={classes.select1}>
        <InputLabel htmlFor="outlined-selection" className={classes.formLabel}>
          Test
        </InputLabel>
        <Select
          label="Target cluster"
          value={test}
          onChange={handleTestChange}
          inputProps={{
            name: 'name',
            id: 'outlined-selection',
          }}
          className={classes.formSize}
          color="secondary"
          disableUnderline
        >
          <MenuItem value="">
            <Typography className={classes.menuItem}>All</Typography>
          </MenuItem>
          {tests.map((test: any) => (
            <MenuItem value={test}>
              <Typography className={classes.menuItem}>{test}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DateRangeSelector
        anchorEl={dateRangeSelectorRef.current as any}
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
