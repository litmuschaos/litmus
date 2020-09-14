import {
  Typography,
  InputBase,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  TextField,
} from '@material-ui/core';
import React, { ChangeEvent, useRef, useState } from 'react';
import useStyles from './styles';
import SearchIcon from '@material-ui/icons/Search';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { useEffect } from 'react';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';

interface ClusterCallBackType {
  (clusterName: string): void;
}

interface RangeCallBackType {
  (selectedStartDate: string, selectedEndDate: string): void;
}

interface CompareCallBackType {
  (compareWorkflows: boolean): void;
}

interface ExportCallBackType {
  (exportAnalytics: boolean): void;
}

interface TableToolBarProps {
  numSelected: number;
  searchToken: string;
  handleSearch: (
    event?: ChangeEvent<{ value: unknown }>,
    token?: string
  ) => void;
  clusters: string[];
  callbackToSetCluster: ClusterCallBackType;
  callbackToSetRange: RangeCallBackType;
  callbackToCompare: CompareCallBackType;
  callbackToExport: ExportCallBackType;
  comparisonState: Boolean;
  reInitialize: Boolean;
}

interface RangeType {
  startDate: string;
  endDate: string;
}

const TableToolBar: React.FC<TableToolBarProps> = ({
  numSelected,
  handleSearch,
  searchToken,
  clusters,
  callbackToSetCluster,
  callbackToSetRange,
  callbackToCompare,
  callbackToExport,
  comparisonState,
  reInitialize,
}) => {
  const classes = useStyles();

  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });

  const [cluster, setCluster] = React.useState<String>('');

  const [compare, setCompare] = React.useState<Boolean>(false);

  const handleClusterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCluster(event.target.value as String);
    callbackToSetCluster(event.target.value as string);
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
      `${
        selectedStartDate.split(' ')[2] +
        ' ' +
        selectedStartDate.split(' ')[1] +
        ' ' +
        selectedStartDate.split(' ')[3]
      }`,
      `${
        selectedEndDate.split(' ')[2] +
        ' ' +
        selectedEndDate.split(' ')[1] +
        ' ' +
        selectedEndDate.split(' ')[3]
      }`
    );
  };

  useEffect(() => {}, [range]);

  const handleClick = () => {
    setCompare(true);
    callbackToCompare(true);
  };

  const handleExport = () => {
    callbackToExport(true);
  };

  const reInitializer = () => {
    setRange({
      startDate: ' ',
      endDate: ' ',
    });
    setCluster('');
  };

  useEffect(() => {}, [compare]);

  useEffect(() => {
    if (comparisonState === false) {
      reInitializer();
    }
  }, []);

  useEffect(() => {
    if (reInitialize === true) {
      reInitializer();
    }
  }, []);

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

      {numSelected > 0 && comparisonState === false ? (
        <span>
          {/* Remove comments to compare.
          <Typography
            variant="h6"
            className={classes.markStyleCorrect}
            display="inline"
          >
            {'\u2713'}
          </Typography>
          <Typography variant="h6" component="div" display="inline">
            <strong>
              &nbsp; {numSelected}{' '}
              {numSelected === 1 ? 'workflow' : 'workflows'} selected
            </strong>
          </Typography>
          */}
        </span>
      ) : (
        <span />
      )}

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
            {range.startDate.split(' ')[2] +
              ' ' +
              range.startDate.split(' ')[1] +
              ' ' +
              range.startDate.split(' ')[3] +
              ' - ' +
              range.endDate.split(' ')[2] +
              ' ' +
              range.endDate.split(' ')[1] +
              ' ' +
              range.endDate.split(' ')[3]}
          </Typography>
        )}
      </Button>

      <FormControl variant="outlined" className={classes.select1}>
        <InputLabel htmlFor="outlined-selection" className={classes.formLabel}>
          Target cluster
        </InputLabel>
        <Select
          label="Target cluster"
          value={cluster}
          onChange={handleClusterChange}
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
          {clusters.map((cluster: any) => (
            <MenuItem value={cluster}>
              <Typography className={classes.menuItem}>{cluster}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {compare === false || comparisonState === false ? (
        <Button
          variant="outlined"
          color="secondary"
          //disabled={numSelected > 1 ? false : true} Remove comments to compare.
          disabled={true}
          className={classes.buttonCompare}
          onClick={handleClick}
        >
          <Typography className={classes.dateRangeDefault}>
            Compare workflows
          </Typography>
        </Button>
      ) : (
        <Button
          variant="outlined"
          color="secondary"
          className={classes.buttonCompare}
          onClick={handleExport}
        >
          <DescriptionOutlinedIcon htmlColor="#5B44BA" />
          <Typography className={classes.dateRangeDefault}>
            Export PDF
          </Typography>
        </Button>
      )}
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
