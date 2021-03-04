import {
  Avatar,
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
import useTheme from '@material-ui/core/styles/useTheme';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';
import { ButtonOutlined } from 'litmus-ui';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import useStyles, { useOutlinedInputStyles } from './styles';

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
  const outlinedInputClasses = useOutlinedInputStyles();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [cluster, setCluster] = React.useState<String>('All');
  const [compare, setCompare] = React.useState<Boolean>(false);
  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });
  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = useState(false);
  const dateRangeSelectorRef = useRef<HTMLButtonElement>(null);

  const handleClusterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCluster(event.target.value as String);
    callbackToSetCluster(event.target.value as string);
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
    setCluster('All');
  };

  useEffect(() => {
    if (comparisonState === false || reInitialize === true) {
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
        classes={{
          input: classes.input,
        }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />

      {numSelected > 0 && comparisonState === false ? (
        <span>
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
              {numSelected === 1
                ? t('analytics.workflowSelected')
                : t('analytics.workflowsSelected')}{' '}
              &nbsp; &emsp;
            </strong>
          </Typography>
        </span>
      ) : (
        <span />
      )}

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

      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel className={classes.selectText}>
          {t('analytics.targetCluster')}
        </InputLabel>
        <Select
          label="Target cluster"
          value={cluster}
          onChange={handleClusterChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
        >
          <MenuItem value="All">All</MenuItem>
          {clusters.map((cluster: string) => (
            <MenuItem value={cluster}>{cluster}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className={classes.featureButtons}>
        {compare === false || comparisonState === false ? (
          <ButtonOutlined disabled={!(numSelected > 1)} onClick={handleClick}>
            <Typography className={classes.dateRangeDefault}>
              {t('analytics.compareWorkflows')}
            </Typography>
          </ButtonOutlined>
        ) : (
          <ButtonOutlined onClick={handleExport} disabled={false}>
            <div className={classes.export}>
              <Avatar className={classes.exportIcon}>
                <DescriptionOutlinedIcon htmlColor={palette.secondary.dark} />
              </Avatar>
              <Typography className={classes.dateRangeDefault} display="inline">
                {t('analytics.exportPDF')}
              </Typography>
            </div>
          </ButtonOutlined>
        )}
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
